# Session Storage Adapters for Drizzle

This package implements the `SessionStorage` interface that works with an instance of [Drizzle](https://orm.drizzle.team).

There are 3 adapters for Drizzle: `DrizzleSessionStoragePostgres`, `DrizzleSessionStorageSQLite` and `DrizzleSessionStorageMySQL`.

Session storage for Drizzle requires a `schema.ts` with a `session` table with at-least the columns as in the example. Make sure to create `session` table and apply changes to the database before using this pakacge.

## Example with PostgreSQL

```ts
import {bigint, boolean, pgTable, text, timestamp} from 'drizzle-orm/pg-core';

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {mode: 'date'}),
  accessToken: text('accessToken'),
  userId: bigint('userId', {mode: 'number'}),
});
```

You can then instantiate and use `DrizzleSessionStoragePostgres` like so:

```ts
import {shopifyApp} from '@shopify/shopify-app-express';
import {DrizzleSessionStoragePostgres} from '@shopify/shopify-app-session-storage-drizzle';

import {db} from './db.server';
import {sessionTable} from './schema';

const storage = new DrizzleSessionStoragePostgres(db, sessionTable);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

## Example with MySQL

```ts
import {
  bigint,
  boolean,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const sessionTable = mysqlTable('session', {
  id: varchar('id', {length: 255}).primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {mode: 'date'}),
  accessToken: text('accessToken'),
  userId: bigint('userId', {mode: 'number'}),
});
```

You can then instantiate and use `DrizzleSessionStorageMySQL` like so:

```ts
import {shopifyApp} from '@shopify/shopify-app-express';
import {DrizzleSessionStorageMySQL} from '@shopify/shopify-app-session-storage-drizzle';

import {db} from './db.server';
import {sessionTable} from './schema';

const storage = new DrizzleSessionStorageMySQL(db, sessionTable);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

## Example with SQLite

```ts
import {sqliteTable, text, integer, blob} from 'drizzle-orm/sqlite-core';

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
```

You can then instantiate and use `DrizzleSessionStorageSQLite` like so:

```ts
import {shopifyApp} from '@shopify/shopify-app-express';
import {DrizzleSessionStorageSQLite} from '@shopify/shopify-app-session-storage-drizzle';

import {db} from './db.server';
import {sessionTable} from './schema';

const storage = new DrizzleSessionStorageSQLite(db, sessionTable);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

## Drizzle Setup

In the example above the file `db.server.ts` should import your database client, drizzle schema and export `db` that you can pass to the storage adapter:

```ts
import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';

import * as schema from './schema';

export const client = createClient({
  url: 'file:./dev.db',
});

export const db = drizzle(client, {schema});
```

Follow the Drizzle documentation for [PostgreSQL setup](https://orm.drizzle.team/docs/get-started-postgresql), [MySQL setup](https://orm.drizzle.team/docs/get-started-mysql) and [SQLite setup](https://orm.drizzle.team/docs/get-started-sqlite).
