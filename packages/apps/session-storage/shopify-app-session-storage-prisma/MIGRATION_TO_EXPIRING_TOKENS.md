# Migrating to Expiring Tokens

The `@shopify/shopify-app-session-storage-prisma` package now supports expiring offline access tokens. The refresh token and its expiration date are now stored as part of the session if your app is using expiring offline access tokens. This change requires updating the Prisma schema to include the refresh token information.

## Updating the Prisma schema

Update the `Session` model in the Prisma schema to include the refresh token information:

```prisma
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  // ... existing fields ...
  // New fields
  refreshToken        String?
  refreshTokenExpires DateTime?
}
```

Run the following prisma commands to update the database schema:

```sh
npx prisma migrate dev
```

### Update Types

Update the generated types to include the new fields:

```sh
npx prisma generate
```

## Using the refreshToken

The refresh token will now be available on the `Session` object if your app is using expiring offline access tokens.

You can enable expiring offline access tokens in the `shopifyApp` object in your `shopify.server` file.

```diff
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
+ future: {
+   expiringOfflineAccessTokens: true,
+ },
```
