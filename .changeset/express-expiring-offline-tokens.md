---
'@shopify/shopify-app-express': minor
---

Add support for expiring offline access tokens. Offline access tokens can now expire, and this package can request them at install and automatically refresh them before they expire, so merchants don't need to re-authenticate.

This is behind a new `expiringOfflineAccessTokens` future flag and is **off by default**, so existing apps are unaffected until they opt in.

- When enabled, the OAuth callback requests an expiring offline token, and `validateAuthenticatedSession` refreshes the offline token before use when it is expired or within 5 minutes of expiring.
- A new `shopify.ensureValidOfflineSession(shop)` helper loads an offline session and refreshes its token if needed. Use it from work that does not pass through `validateAuthenticatedSession` (webhook handlers, fulfillment services, cron jobs, queues). It throws if called while the flag is off, so a misconfigured app fails loudly instead of silently skipping refresh.

## How to migrate

### 1. Update your dependencies

Update `@shopify/shopify-app-express`, `@shopify/shopify-api`, and your session storage package to the latest version.

### 2. Make sure your session storage persists refresh tokens

The refresh token is stored on the session, so your session storage must persist the `refreshToken` and `refreshTokenExpires` fields. The official SQL-based adapters (SQLite, MySQL, PostgreSQL, etc.) add these columns automatically through their migrations when you update to the latest version. If you use a custom session storage, add the two fields to your schema.

### 3. Enable the future flag

```diff
  import { shopifyApp } from "@shopify/shopify-app-express";
  import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";

  const shopify = shopifyApp({
    api: {
      // ...
    },
    auth: {
      path: "/api/auth",
      callbackPath: "/api/auth/callback",
    },
    webhooks: {
      path: "/api/webhooks",
    },
+   future: {
+     expiringOfflineAccessTokens: true,
+   },
    sessionStorage: new SQLiteSessionStorage(DB_PATH),
  });
```

### 4. Re-install the app so it mints an expiring token

Existing installs keep their non-expiring token until the next OAuth. Re-authenticating the app (or installing on a fresh store) mints an expiring offline token and stores the refresh token.

### 5. Refresh the token in background work

Requests that flow through `validateAuthenticatedSession` refresh the offline token automatically. Work that does not (webhook handlers, cron jobs, queues) should load the offline session through the new helper:

```diff
- const sessionId = shopify.api.session.getOfflineId(shop);
- const session = await shopify.config.sessionStorage.loadSession(sessionId);
+ const session = await shopify.ensureValidOfflineSession(shop);

  const client = new shopify.api.clients.Graphql({ session });
```
