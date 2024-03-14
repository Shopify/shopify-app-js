import * as child_process from 'child_process';
import {promisify} from 'util';

import mysql2 from 'mysql2/promise';
import {
  batteryOfTests,
  poll,
} from '@shopify/shopify-app-session-storage-test-utils';
import {
  mysqlTable,
  text,
  boolean,
  timestamp,
  bigint,
  varchar,
} from 'drizzle-orm/mysql-core';
import {drizzle} from 'drizzle-orm/mysql2';

import {DrizzleSessionStorageMySQL} from '../adapters/drizzle-mysql.adapter';

const exec = promisify(child_process.exec);

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'passify#$',
  database: 'shop&test',
  port: 3307,
};

const sessionTable = mysqlTable('session', {
  id: varchar('id', {length: 255}).primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {mode: 'date'}),
  accessToken: text('accessToken'),
  userId: bigint('userId', {mode: 'number'}),
});

describe('DrizzleSessionStorageMySQL', () => {
  let drizzleSessionStorage: DrizzleSessionStorageMySQL;
  let containerId: string;
  let connection: mysql2.Connection;

  beforeAll(async () => {
    const runCommand = await exec(
      "podman run -d -e MYSQL_DATABASE='shop&test' -e MYSQL_USER='shop&fy' -e MYSQL_PASSWORD='passify#$' -e MYSQL_ROOT_PASSWORD='passify#$' -p 3307:3306 mysql:8-oracle",
      {encoding: 'utf8'},
    );

    containerId = runCommand.stdout.trim();

    await poll(
      async () => {
        try {
          connection = await mysql2.createConnection(dbConfig);
        } catch (_error) {
          // console.error(_error);
          return false;
        }
        return true;
      },
      {interval: 500, timeout: 20000},
    );

    await connection.query(`
  CREATE TABLE IF NOT EXISTS \`session\` (
    \`id\` varchar(255) NOT NULL,
    \`shop\` text NOT NULL,
    \`state\` text NOT NULL,
    \`isOnline\` boolean NOT NULL DEFAULT false,
    \`scope\` text,
    \`expires\` timestamp NULL,
    \`accessToken\` text,
    \`userId\` bigint,
    CONSTRAINT \`session_id\` PRIMARY KEY (\`id\`)
  );
`);

    const drizzleDb = drizzle(connection);

    drizzleSessionStorage = new DrizzleSessionStorageMySQL(
      drizzleDb,
      sessionTable,
    );
  });

  afterAll(async () => {
    if (connection) {
      await connection.end();
    }

    await exec(`podman rm -f ${containerId}`);
  });

  batteryOfTests(async () => drizzleSessionStorage);
});
