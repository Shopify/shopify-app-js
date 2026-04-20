# Migrating to Token Exchange Authentication

This guide walks you through migrating an embedded Express app from the OAuth redirect flow to the token exchange flow.

## Prerequisites

Before enabling token exchange, your app must meet the following requirements:

1. **Shopify managed installation**: Your app must use [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation). This means Shopify handles the installation process, and your app does not need to redirect merchants through an OAuth grant screen.

2. **Scopes declared in `shopify.app.toml`**: Your app's access scopes must be declared in your `shopify.app.toml` configuration file rather than passed to the `shopifyApp()` function. Shopify uses these scopes during managed installation.

3. **Embedded app**: Token exchange is designed for embedded apps that run inside the Shopify Admin. Non-embedded apps should continue using the OAuth redirect flow.

## Enabling Token Exchange

Set the `unstable_newEmbeddedAuthStrategy` future flag when configuring your app:

```ts
const shopify = shopifyApp({
  api: {
    apiKey: 'ApiKeyFromPartnersDashboard',
    apiSecretKey: 'ApiSecretKeyFromPartnersDashboard',
    hostScheme: 'http',
    hostName: `localhost:${PORT}`,
    // Note: scopes are declared in shopify.app.toml, not here
  },
  auth: {
    path: '/auth',
    callbackPath: '/auth/callback',
  },
  webhooks: {
    path: '/webhooks',
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
});
```

## Removing OAuth Routes

With Shopify managed installation and token exchange enabled, the OAuth redirect flow is never used for embedded apps. The `/auth` and `/auth/callback` routes become dead code and can be removed:

```ts
// These routes are no longer needed with token exchange + managed install.
// app.get(shopify.config.auth.path, shopify.auth.begin());
// app.get(
//   shopify.config.auth.callbackPath,
//   shopify.auth.callback(),
//   shopify.redirectToShopifyOrAppRoot(),
// );
```

> **Note**: Keep these routes if your app also supports non-embedded (standalone) installation scenarios.

## Moving Webhook Registration to `afterAuth`

With the OAuth flow, webhooks are automatically registered during the OAuth callback. When using token exchange, authentication no longer goes through the OAuth callback on every request, so webhook registration should be moved to the `afterAuth` hook using `shopify.registerWebhooks`.

The `afterAuth` hook is called after a merchant successfully authenticates — both via the OAuth callback (during initial installation) and via token exchange (on subsequent requests when a new session is created).

```ts
const shopify = shopifyApp({
  // ...api, auth, webhooks config
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  hooks: {
    afterAuth: async ({session}) => {
      // Register webhooks using the convenience method on the shopify object
      await shopify.registerWebhooks({session});

      // Any other post-auth setup (e.g., database seeding)
    },
  },
});
```

> **Note**: In the token exchange path, the `afterAuth` hook is deduplicated — if App Bridge retries a request with the same session token, the hook will only execute once.

## How the Flow Works End-to-End

```
Browser (embedded in Shopify Admin)
  │
  ├─ 1. Page load → GET /my-page?shop=...&embedded=1
  │       ensureInstalledOnShop detects the flag is ON, skips session check,
  │       sets CSP headers, and calls next() — no OAuth redirect.
  │
  ├─ 2. Frontend loads → App Bridge initialises and obtains a session token
  │       (a JWT signed by Shopify for your app's API key).
  │
  ├─ 3. API call → GET /api/products
  │       Authorization: Bearer <session-token>
  │       validateAuthenticatedSession detects the Bearer token and calls
  │       performTokenExchange.
  │
  ├─ 4. Token exchange → the library calls Shopify's token exchange endpoint
  │       using the session token as a subject token. Shopify returns an
  │       offline (and optionally online) access token.
  │
  └─ 5. afterAuth hook fires → shopify.registerWebhooks({session}) registers
         any webhook topics declared in your config for this shop.
```

## Key Differences from the OAuth Flow

| Feature | OAuth redirect | Token exchange |
|---|---|---|
| **Initial install** | Redirects merchant through OAuth consent | Shopify managed — no redirect needed |
| **Embedded page load** | Requires session in DB; redirects to OAuth if missing | Skips session check; always loads the app |
| **Access token acquisition** | Auth code exchanged server-side after redirect | JWT session token exchanged on first API request |
| **Redirect flickering** | Visible redirects when the session expires or is missing | No redirects — authentication happens transparently |
| **Webhook registration** | Automatic inside `auth.callback()` | Manual via `afterAuth` + `shopify.registerWebhooks` |
| **Non-embedded support** | Full support | Falls back to redirect for non-embedded installs |
| **Concurrent request deduplication** | N/A | `afterAuth` called once per session token |

## Using Expiring Offline Access Tokens

The `expiringOfflineAccessTokens` future flag can be used alongside token exchange (or independently with the OAuth flow). When enabled, offline access tokens include a `refreshToken` and expire after a set period. The package automatically refreshes these tokens when they are within 5 minutes of expiry.

```ts
const shopify = shopifyApp({
  // ...api, auth, webhooks config
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    expiringOfflineAccessTokens: true,
  },
  hooks: {
    afterAuth: async ({session}) => {
      await shopify.registerWebhooks({session});
    },
  },
});
```

When both flags are enabled:

- **Token exchange path**: If the existing session is within 5 minutes of expiry, a fresh token exchange is performed automatically. The new session includes an updated `refreshToken`.
- **OAuth path**: After validating the session, the middleware checks whether the offline token is close to expiry and refreshes it using the stored `refreshToken` before continuing.

In both cases, the refreshed session is stored automatically -- no additional code is needed in your app.
