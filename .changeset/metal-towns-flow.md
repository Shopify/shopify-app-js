---
'@shopify/shopify-app-react-router': minor
---

We are introducing support for expiring offline access tokens. This feature improves security by limiting the lifespan of offline access tokens and automatically refreshing them using refresh tokens.

- **New Future Flag**: Added `expiringOfflineAccessTokens` (boolean) to the `future` configuration in `shopifyApp`. When enabled, the library will start using expiring offline tokens and automatically check if it is expired or nearing expiration. If expired/expiring, it attempts to refresh the access token using the stored refresh token. Defaults to `false` for backward compatibility.

- **Automatic Token Refresh**: Integrated token refresh logic into authentication flows (`flow`, `fulfillmentService`, `appProxy`, `webhooks`) and unauthenticated contexts (`admin`, `storefront`). When a session is loaded and found to be expired (or expiring within 5 minutes), and the feature is enabled, the library transparently refreshes the token and persists the new session data. This behavior applies to both offline and online tokens.

To enable expiring offline access tokens in your app, you must ensure your session storage can persist refresh tokens. For now, this will only work if you are using the Prisma Session Storage package. We're starting with Prisma since this is what the majority of our developers use. If you're using a different session storage adapter and would like support for expiring offline tokens, we'd love to hear from you! If you are using Prisma, follow these steps:

1. Update your `@shopify/shopify-api` and `@shopify/shopify-app-session-storage-prisma` packages to the latest version.

2. Update your Prisma schema to include the `refreshToken` and `refreshTokenExpires` fields in the `Session` model:

```prisma
model Session {
  // ...
  refreshToken        String?
  refreshTokenExpires DateTime?
}
```

3. Run a migration to update your database:

```sh
npx prisma migrate dev
```

4. Update the generated types to include the new fields:

```sh
npx prisma generate
```

5. Enable the future flag in your app configuration:

```ts
const shopify = shopifyApp({
  // ... other config
  future: {
    expiringOfflineAccessTokens: true,
  },
});
```

When enabled, calls to `shopify.authenticate.admin`, `shopify.authenticate.flow`, etc., will automatically handle token refreshing for offline sessions.