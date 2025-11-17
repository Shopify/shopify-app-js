---
'@shopify/shopify-api': minor
---

This change introduces full support for OAuth refresh tokens in the `@shopify/shopify-api` package, enabling apps to use expiring access tokens and rotate them securely.

- **Session Model Updates**: The `Session` class now includes properties to store refresh token information:
  - `refreshToken`: The refresh token string.
  - `refreshTokenExpires`: The date when the refresh token expires.
  - Serialization logic has been updated to persist these fields.

- **New Auth Methods**:
  - `shopify.auth.refreshToken`: A new method to exchange a refresh token for a new access token.
  - `shopify.auth.migrateToExpiringToken`: A helper method to migrate existing non-expiring offline tokens to expiring tokens.

- **Token Exchange Updates**:
  - The `tokenExchange` method now accepts an `expiring` parameter to request expiring access tokens.

```ts
// Migrating a non-expiring token
const {session} = await shopify.auth.migrateToExpiringToken({
  shop: 'my-shop.myshopify.com',
  nonExpiringOfflineAccessToken: 'shpo_...',
});

// Refreshing an expired token
const {session: newSession} = await shopify.auth.refreshToken({
  shop: session.shop,
  refreshToken: session.refreshToken,
});

console.log(newSession.accessToken); // New access token
console.log(newSession.refreshToken); // New refresh token
```
