# Migrating to Expiring Tokens

The `@shopify/shopify-app-session-storage-memory` package now supports expiring offline access tokens. The refresh token and its expiration date are automatically stored as part of the session if your app is using expiring offline access tokens.

## No Migration Required

Unlike database-backed session storage implementations (Prisma, Drizzle, etc.), the in-memory storage requires **no schema changes or data migration**. The memory storage stores the complete Session object directly, so refresh token fields are automatically preserved.

## Using the refreshToken

The refresh token will be available on the `Session` object if your app is using expiring offline access tokens.

You can enable expiring offline access tokens in the `shopifyApp` object in your `shopify.server` file:

```diff
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  sessionStorage: new MemorySessionStorage(),
  distribution: AppDistribution.AppStore,
+ future: {
+   expiringOfflineAccessTokens: true,
+ },
```

## Important Note

This session storage model is for local development only. It will delete all sessions if the app process gets restarted or redeployed, and is not meant for production use. For persistent storage with refresh token support, use one of the database-backed options like `@shopify/shopify-app-session-storage-prisma` or `@shopify/shopify-app-session-storage-drizzle`.
