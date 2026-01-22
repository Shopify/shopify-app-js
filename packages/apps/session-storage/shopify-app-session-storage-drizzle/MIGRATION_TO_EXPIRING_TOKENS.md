# Migrating to Expiring Tokens

The `@shopify/shopify-app-session-storage-drizzle` package now supports expiring offline access tokens. The refresh token and its expiration date are now stored as part of the session if your app is using expiring offline access tokens. This change requires updating your Drizzle schema and database to include the refresh token information.

## Updating the Drizzle schema

Update your `Session` table definition to include the refresh token information.

Postgres:

```ts
export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {mode: 'date'}),
  accessToken: text('accessToken').notNull(),
  userId: bigint('userId', {mode: 'number'}),
  // ... existing fields ...
  // New fields
  refreshToken: text('refreshToken'),
  refreshTokenExpires: timestamp('refreshTokenExpires', {mode: 'date'}),
});
```

MySQL:

```ts
export const sessionTable = mysqlTable('session', {
  id: varchar('id', {length: 255}).primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: boolean('isOnline').default(false).notNull(),
  scope: text('scope'),
  expires: timestamp('expires', {mode: 'date'}),
  accessToken: text('accessToken').notNull(),
  userId: bigint('userId', {mode: 'number'}),
  // ... existing fields ...
  // New fields
  refreshToken: text('refreshToken'),
  refreshTokenExpires: timestamp('refreshTokenExpires', {mode: 'date'}),
});
```

SQLite:

```ts
export const sessionTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: integer('isOnline', {mode: 'boolean'}).notNull().default(false),
  scope: text('scope'),
  expires: text('expires'),
  accessToken: text('accessToken').notNull(),
  userId: blob('userId', {mode: 'bigint'}),
  // ... existing fields ...
  // New fields
  refreshToken: text('refreshToken'),
  refreshTokenExpires: text('refreshTokenExpires'),
});
```

## Apply the database migration

Apply your schema changes with your migration workflow (for example, using `drizzle-kit` or your own migration system). At a minimum, you need to add the following columns:

- `refreshToken`
- `refreshTokenExpires`

If you use drizzle-kit, your commands might look like:

```sh
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Using the refreshToken

The refresh token will now be available on the `Session` object if your app is using expiring offline access tokens.

You can enable expiring offline access tokens in the `shopifyApp` object in your `shopify.server` file.

```diff
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  sessionStorage: const storage = new DrizzleSessionStoragePostgres(db, sessionTable);,
  distribution: AppDistribution.AppStore,
+  future: {
+    expiringOfflineAccessTokens: true,
+  },
```
