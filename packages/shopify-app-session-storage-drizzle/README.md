# Session Storage Adapter for Drizzle

This package implements the `SessionStorage` interface that works with an instance of [Drizzle](https://orm.drizzle.team).

Session storage for Drizzle requires a `schema.ts` with a Session table with at-least the following columns:

```ts
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
```

You can then instantiate and use `DrizzleSessionStorage` like so:

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {DrizzleSessionStorage} from '@shopify/shopify-app-session-storage-drizzle';

import {db} from './db.server';
import {sessions} from './schema';

const storage = new DrizzleSessionStorage(db, {table: sessions});

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```
