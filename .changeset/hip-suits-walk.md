---
'@shopify/shopify-app-remix': minor
---

---

## '@shopify/shopify-app-remix': minor

We are introducing support for expiring offline access tokens. This feature improves security by limiting the lifespan of offline access tokens and automatically refreshing them using refresh tokens.

- **New Future Flag**: Added `expiringOfflineAccessTokens` (boolean) to the `future` configuration in `shopifyApp`.
  - When enabled, the library will start using expiring offline tokens and automatically check if it is expired or nearing expiration.
  - If expired/expiring, it attempts to refresh the access token using the stored refresh token.
  - Defaults to `false` for backward compatibility.
- **Automatic Token Refresh**:
  - Integrated token refresh logic into authentication flows (`flow`, `fulfillmentService`, `appProxy`, `webhooks`) and unauthenticated contexts (`admin`, `storefront`).
  - When a session is loaded and found to be expired (or expiring within 1 second), and the feature is enabled, the library transparently refreshes the token and persists the new session data.
    To enable expiring offline access tokens in your app:

```ts
const shopify = shopifyApp({
  // ... other config
  future: {
    expiringOfflineAccessTokens: true,
  },
});
```

When enabled, calls to `shopify.authenticate.admin`, `shopify.authenticate.flow`, etc., will automatically handle token refreshing for offline sessions.

- None. The feature is opt-in via the `expiringOfflineAccessTokens` future flag.
