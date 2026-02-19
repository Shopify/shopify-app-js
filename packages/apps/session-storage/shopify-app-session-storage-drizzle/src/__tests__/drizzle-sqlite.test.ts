// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as fs from 'fs/promises';
import {resolve} from 'node:path';

import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {sqliteTable, blob, text, integer} from 'drizzle-orm/sqlite-core';
import {drizzle} from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import {DrizzleSessionStorageSQLite} from '../adapters/drizzle-sqlite.adapter';

export const sessionTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: integer('isOnline', {mode: 'boolean'}).notNull().default(false),
  scope: text('scope'),
  expires: text('expires'),
  accessToken: text('accessToken').notNull(),
  userId: blob('userId', {mode: 'bigint'}),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email'),
  accountOwner: integer('accountOwner', {mode: 'boolean'}),
  locale: text('locale'),
  collaborator: integer('collaborator', {mode: 'boolean'}),
  emailVerified: integer('emailVerified', {mode: 'boolean'}),
  refreshToken: text('refreshToken'),
  refreshTokenExpires: text('refreshTokenExpires'),
});

describe('SQLiteSessionStorage', () => {
  const sqliteDbFile = resolve(__dirname, './sqlite-drizzle.testDb');
  let drizzleSessionStorage: DrizzleSessionStorageSQLite;
  let sqlite: Database.Database;

  beforeAll(async () => {
    await fs.rm(sqliteDbFile, {force: true});

    sqlite = new Database(sqliteDbFile);
    sqlite
      .prepare(
        `CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY NOT NULL,
      "shop" text NOT NULL,
      "state" text NOT NULL,
      "isOnline" integer DEFAULT false NOT NULL,
      "scope" text,
      "expires" text,
      "accessToken" text NOT NULL,
      "userId" blob,
      "firstName" text,
      "lastName" text,
      "email" text,
      "accountOwner" integer,
      "locale" text,
      "collaborator" integer,
      "emailVerified" integer,
      "refreshToken" text,
      "refreshTokenExpires" text
    );`,
      )
      .run();

    const drizzleDb = drizzle(sqlite);

    drizzleSessionStorage = new DrizzleSessionStorageSQLite(
      drizzleDb,
      sessionTable,
    );
  });

  afterAll(async () => {
    if (sqlite) {
      sqlite.close();
    }

    await fs.rm(sqliteDbFile, {force: true});
  });

  batteryOfTests(async () => drizzleSessionStorage);
});
