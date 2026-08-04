---
'@shopify/shopify-app-express': minor
---

Add token exchange authentication support for embedded apps, behind the `tokenExchange` future flag.

When enabled, embedded apps get access tokens via [token exchange](https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-app-express/docs/reference/guides/token-exchange.md) instead of the OAuth redirect flow: on load, App Bridge provides a short-lived session token that the app exchanges with Shopify for an API access token. This removes the redirect flicker the Auth Code flow causes on load. Non-embedded apps, and apps with the flag off, continue to use the Auth Code flow. (Auth Code flow and token exchange are both OAuth flows.)

**Requirements:** the app must be embedded (`isEmbeddedApp: true`), use [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation), and load [App Bridge](https://shopify.dev/docs/api/app-bridge-library) on the frontend. Enabling the flag on a non-embedded app throws at startup.

**Enabling it:**

```diff
  const shopify = shopifyApp({
    api: {/* ... */},
    auth: {path: '/api/auth', callbackPath: '/api/auth/callback'},
    webhooks: {path: '/api/webhooks'},
+   future: {
+     tokenExchange: true,
+   },
+   hooks: {
+     afterAuth: async ({session}) => {
+       await shopify.registerWebhooks({session});
+     },
+   },
  });
```

**What changes when enabled:**

- `validateAuthenticatedSession` uses token exchange for embedded apps (decided once, up front: token exchange when the flag is on and the app is embedded, otherwise the Auth Code flow).
- Fetch requests with a missing or stale session token get a `401` with the `X-Shopify-Retry-Invalid-Session-Request` header, so App Bridge fetches a fresh token and retries.
- Document requests with a missing or stale session token render App Bridge, which fetches a fresh token and reloads. No top-level OAuth redirect.
- The OAuth routes (`auth.begin` / `auth.callback`) are not used and return an error if called.
- Revoked (but unexpired) tokens are not re-authenticated automatically. Handle a `401` from the Admin API by retrying the request (which triggers a fresh exchange) or re-authenticating. Expired tokens are handled automatically.

This also adds a `hooks.afterAuth` config option and a `shopify.registerWebhooks({session})` helper for registering webhooks outside the OAuth callback.

Builds on the original work by [@mrmarufpro](https://github.com/mrmarufpro) in [#3097](https://github.com/Shopify/shopify-app-js/pull/3097). Thank you for contributing this.
