import {bigint, boolean, pgTable, text, timestamp} from 'drizzle-orm/pg-core';

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {precision: 3, mode: 'string'}),
  accessToken: text('accessToken'),
  userId: bigint('userId', {mode: 'bigint'}),
});

export type PgSessionTable = typeof session;
