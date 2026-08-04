# Token exchange

Token exchange lets embedded apps get access tokens without the OAuth redirect flow. When an embedded app loads, App Bridge provides a short-lived session token; the app exchanges that token with Shopify for an API access token. This removes the redirect flicker that the OAuth code flow causes on load.

Support is behind the `unstable_tokenExchange` future flag and is off by default.

## Requirements

- The app must be **embedded** (`isEmbeddedApp: true`, the default).
- The app must use [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation).
- The frontend must load [App Bridge](https://shopify.dev/docs/api/app-bridge-library), which provides the session token.

Non-embedded apps with the flag off continue to use the OAuth code flow. Enabling the flag on a non-embedded app (`isEmbeddedApp: false`) throws at startup, because token exchange requires the App Bridge session token that only embedded apps have.

## Enabling it

```ts
import {shopifyApp} from '@shopify/shopify-app-express';

const shopify = shopifyApp({
  api: {
    /* ... */
  },
  auth: {path: '/api/auth', callbackPath: '/api/auth/callback'},
  webhooks: {path: '/api/webhooks'},
  future: {
    unstable_tokenExchange: true,
  },
  hooks: {
    afterAuth: async ({session}) => {
      await shopify.registerWebhooks({session});
    },
  },
});
```

## What changes when it is enabled

- `validateAuthenticatedSession` uses token exchange for embedded apps. It decides once, up front: token exchange when the flag is on and the app is embedded, otherwise the OAuth code flow.
- **Fetch requests** with a missing or stale session token receive a `401` with the `X-Shopify-Retry-Invalid-Session-Request` header, so App Bridge fetches a fresh token and retries.
- **Document requests** (page loads) with a missing or stale session token render App Bridge, which fetches a fresh token and reloads the page. No top-level OAuth redirect.
- The OAuth routes (`auth.begin` / `auth.callback`) are not used and return an error if called.

## Handling revoked access tokens

Token exchange reuses a stored access token while it is unexpired. If a token is **revoked** by the merchant before it expires, it still looks valid locally, so the library will use it and the Admin API call will fail with a `401`. The library does not automatically re-authenticate in that case, so your app should handle a `401` from the Admin API by re-running the request (which triggers a fresh token exchange) or re-authenticating. Expired tokens are handled automatically.

## Webhooks

The OAuth code flow registers webhooks in its callback. Token exchange has no such callback, so register webhooks yourself with `shopify.registerWebhooks({session})`, typically from the `afterAuth` hook (see the example above).
