# Session Storage Adapters for Drizzle

This package implements the `SessionStorage` interface that works with an instance of [Drizzle](https://orm.drizzle.team).

There are 3 adapters for Drizzle: `DrizzlePgAdapter`, `DrizzleSQLiteAdapter` and `DrizzleMySQLAdapter` which is in development. 


Session storage for Drizzle requires a `schema.ts` with a `session` table with at-least the columns as in the example. Make sure to create `session` table and apply changes to the database before using this pakacge.

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

You can then instantiate and use `DrizzleSQLiteAdapter` like so:

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {DrizzleSQLiteAdapter} from '@shopify/shopify-app-session-storage-drizzle';

import {db} from './db.server';
import {sessionTable} from './schema';

const storage = new DrizzleSQLiteAdapter(db, sessionTable);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```
