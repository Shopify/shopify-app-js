import {sqliteTable, text, integer, blob} from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: integer('isOnline', {mode: 'boolean'}).notNull().default(false),
  scope: text('scope'),
  expires: text('expires'),
  accessToken: text('accessToken'),
  userId: blob('userId', {mode: 'bigint'}),
});
