---
'@shopify/shopify-app-react-router': minor
---

Add a Cloudflare Workers adapter at `@shopify/shopify-app-react-router/adapters/cloudflare`. Pulls in the underlying `@shopify/shopify-api/adapters/cf-worker` runtime (Web standards `fetch`, Request/Response/Headers, `crypto.subtle`) and identifies itself as `React Router (Cloudflare Worker)` so users no longer have to rely on `nodejs_compat` and the Node adapter when deploying to Cloudflare Workers.
