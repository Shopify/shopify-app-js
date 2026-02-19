// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as child_process from 'child_process';
import {promisify} from 'util';

import {
  batteryOfTests,
  poll,
} from '@shopify/shopify-app-session-storage-test-utils';
import {drizzle} from 'drizzle-orm/node-postgres';
import {bigint, boolean, pgTable, text, timestamp} from 'drizzle-orm/pg-core';
import pg from 'pg';

import {DrizzleSessionStoragePostgres} from '../adapters/drizzle-postgres.adapter';

const exec = promisify(child_process.exec);

const dbURL = new URL(
  `postgres://${encodeURIComponent('newUser')}:${encodeURIComponent(
    'newPass#123',
  )}@localhost:${encodeURIComponent('5434')}/${encodeURIComponent(
    'newShopDB',
  )}`,
);

const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {mode: 'date'}),
  accessToken: text('accessToken').notNull(),
  userId: bigint('userId', {mode: 'number'}),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email'),
  accountOwner: boolean('accountOwner'),
  locale: text('locale'),
  collaborator: boolean('collaborator'),
  emailVerified: boolean('emailVerified'),
  refreshToken: text('refreshToken'),
  refreshTokenExpires: timestamp('refreshTokenExpires', {mode: 'date'}),
});

describe('DrizzleSessionStoragePostgres', () => {
  let containerId: string;
  let client: pg.Client;
  let drizzleSessionStorage: DrizzleSessionStoragePostgres;

  beforeAll(async () => {
    const runCommand = await exec(
      "podman run -d -e POSTGRES_DB='newShopDB' -e POSTGRES_USER='newUser' -e POSTGRES_PASSWORD='newPass#123' -p 5434:5432 postgres:15",
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
            port: Number(dbURL.port),
          });

          await client.connect();
        } catch (error) {
          // console.error(error);

          return false;
        }

        return true;
      },
      {interval: 500, timeout: 20000},
    );

    await client.query(`CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "shop" TEXT NOT NULL,
      "state" TEXT NOT NULL,
      "isOnline" BOOLEAN NOT NULL DEFAULT false,
      "scope" TEXT,
      "expires" TIMESTAMP,
      "accessToken" TEXT NOT NULL,
      "userId" BIGINT,
      "firstName" TEXT,
      "lastName" TEXT,
      "email" TEXT,
      "accountOwner" BOOLEAN,
      "locale" TEXT,
      "collaborator" BOOLEAN,
      "emailVerified" BOOLEAN,
      "refreshToken" TEXT,
      "refreshTokenExpires" TIMESTAMP
    )`);

    const drizzleDb = drizzle(client);

    drizzleSessionStorage = new DrizzleSessionStoragePostgres(
      drizzleDb,
      sessionTable,
    );
  });

  afterAll(async () => {
    if (client) {
      await client.end();
    }

    await exec(`podman rm -f ${containerId}`);
  });

  batteryOfTests(async () => drizzleSessionStorage, true, true);
});
