---
'@shopify/shopify-app-react-router': minor
---

Add a Cloudflare Workers adapter at `@shopify/shopify-app-react-router/adapters/cloudflare`. Pulls in the underlying `@shopify/shopify-api/adapters/cf-worker` runtime (Web standards `fetch`, Request/Response/Headers, `crypto.subtle`) and identifies itself as `React Router (Cloudflare Worker)`, so consumers deploying to Cloudflare Workers no longer need the Node adapter and its polyfills. The `nodejs_compat` compatibility flag is optional: without it, the adapter still loads — the only feature that requires it is the `process.env.APP_BRIDGE_URL` override, which is skipped gracefully when `process` is unavailable (callers can always set the override explicitly via `setAppBridgeUrlOverride`).
