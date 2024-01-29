import * as child_process from 'child_process';
import {promisify} from 'util';

import {
  batteryOfTests,
  poll,
} from '@shopify/shopify-app-session-storage-test-utils';
import {sql} from 'drizzle-orm';
import {drizzle} from 'drizzle-orm/node-postgres';
import {
  PgDatabase,
  QueryResultHKT,
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import pg from 'pg';

import {DrizzleSessionStoragePostgres} from '../adapters/drizzle-postgres.adapter';

const exec = promisify(child_process.exec);

const dbURL = new URL(
  `postgres://${encodeURIComponent('shop&fy')}:${encodeURIComponent(
    'passify#$',
  )}@localhost/${encodeURIComponent('shop&test')}`,
);

export const sessionTable = pgTable('session' as string, {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {precision: 3, mode: 'string'}),
  accessToken: text('accessToken'),
  userId: bigint('userId', {mode: 'bigint'}),
});

describe('DrizzleSessionStoragePostgres', () => {
  let drizzleDb: PgDatabase<QueryResultHKT>;
  let containerId: string;
  let client: pg.Client;
  let drizzleSessionStorage: DrizzleSessionStoragePostgres;

  beforeAll(async () => {
    const runCommand = await exec(
      "podman run -d -e POSTGRES_DB='shop&test' -e POSTGRES_USER='shop&fy' -e POSTGRES_PASSWORD='passify#$' -p 5432:5432 postgres:15",
      {encoding: 'utf8'},
    );

    containerId = runCommand.stdout.trim();

    await poll(
      async () => {
        try {
          client = new pg.Client({
            host: dbURL.hostname,
            user: decodeURIComponent(dbURL.username),
            password: decodeURIComponent(dbURL.password),
            database: decodeURIComponent(dbURL.pathname.slice(1)),
          });

          await client.connect();
        } catch (error) {
          // console.error(error);  // uncomment to see error for debugging tests
          await client.end();

          return false;
        }

        return true;
      },
      {interval: 500, timeout: 20000},
    );

    drizzleDb = drizzle(client);

    await drizzleDb.execute(sql`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "shop" TEXT NOT NULL,
      "state" TEXT NOT NULL,
      "isOnline" BOOLEAN NOT NULL DEFAULT false,
      "scope" TEXT,
      "expires" TIMESTAMP(3),
      "accessToken" TEXT,
      "userId" BIGINT
    )
    `);

    drizzleSessionStorage = new DrizzleSessionStoragePostgres(
      drizzleDb,
      sessionTable,
    );
  });

  afterAll(async () => {
    await client.end();

    await exec(`podman rm -f ${containerId}`);
  });

  batteryOfTests(async () => drizzleSessionStorage);
});
