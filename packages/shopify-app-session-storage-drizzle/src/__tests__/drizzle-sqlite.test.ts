import * as fs from 'fs/promises';
import {resolve} from 'node:path';

import {Session} from '@shopify/shopify-api';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {
  sqliteTable,
  blob,
  text,
  integer,
  BaseSQLiteDatabase,
} from 'drizzle-orm/sqlite-core';
import {drizzle} from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import {sql} from 'drizzle-orm';

import {DrizzleSessionStorageSQLite} from '../adapters/drizzle-sqlite.adapter';

export const sessionTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: integer('isOnline', {mode: 'boolean'}).notNull().default(false),
  scope: text('scope'),
  expires: text('expires'),
  accessToken: text('accessToken'),
  userId: blob('userId', {mode: 'bigint'}),
});

describe('SQLiteSessionStorage', () => {
  const sqliteDbFile = resolve(__dirname, './sqlite.testDb');
  let drizzleDb: BaseSQLiteDatabase<'sync' | 'async', any, any>;
  let drizzleSessionStorage: DrizzleSessionStorageSQLite;
  let sqlite: Database.Database;

  beforeAll(async () => {
    await fs.rm(sqliteDbFile, {force: true});

    sqlite = new Database(sqliteDbFile);
    drizzleDb = drizzle(sqlite);

    await drizzleDb.run(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "shop" text NOT NULL,
        "state" text NOT NULL,
        "isOnline" integer DEFAULT false NOT NULL,
        "scope" text,
        "expires" text,
        "accessToken" text,
        "userId" blob
      );
      `);

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
