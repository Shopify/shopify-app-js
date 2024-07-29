import {
  bigint,
  boolean,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const sessionTable = mysqlTable('session' as string, {
  id: varchar('id', {length: 255}).primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {mode: 'date'}),
  accessToken: text('accessToken'),
  userId: bigint('userId', {mode: 'number'}),
});

export type MySQLSessionTable = typeof sessionTable;
