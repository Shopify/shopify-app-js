---
'@shopify/shopify-app-express': minor
---

We are introducing support for expiring offline access tokens. This feature improves security by limiting the lifespan of offline access tokens and automatically refreshing them using refresh tokens.

- **New future flag**: Added `expiringOfflineAccessTokens` (boolean) to the `future` configuration in `shopifyApp`. When enabled, the library checks whether the offline access token is expired or nearing expiration (within 5 minutes) and, if so, refreshes it using the stored refresh token. Defaults to `false` for backward compatibility.

- **Automatic token refresh**: `validateAuthenticatedSession` refreshes the offline token before use when the flag is enabled. A new `shopify.ensureValidOfflineSession(shop)` helper is also exposed so background work (webhooks, cron jobs, queues) can load an offline session with a valid token.

To enable expiring offline access tokens, your session storage must persist the `refreshToken` and `refreshTokenExpires` fields. Enable the flag in your app configuration:

```ts
const shopify = shopifyApp({
  // ... other config
  future: {
    expiringOfflineAccessTokens: true,
  },
});
```
