import {text, sqliteTable, integer, blob} from 'drizzle-orm/sqlite-core';

export const sessionTable = sqliteTable('session' as string, {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: integer('isOnline', {mode: 'boolean'}).notNull().default(false),
  scope: text('scope'),
  expires: text('expires'),
  accessToken: text('accessToken'),
  userId: blob('userId', {mode: 'bigint'}),
});

export type SQLiteSessionTable = typeof sessionTable;
