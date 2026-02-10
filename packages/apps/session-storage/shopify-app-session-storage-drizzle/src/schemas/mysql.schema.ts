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

export type MySQLSessionTable = typeof sessionTable;
