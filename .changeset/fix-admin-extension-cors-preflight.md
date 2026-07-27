---
"@shopify/shopify-app-express": patch
---

Respond to CORS preflight (`OPTIONS`) requests in `validateAuthenticatedSession` instead of trying to authenticate them. Admin UI extension `fetch` calls to an app's backend send a preflight request that carries no `Authorization` header, so the middleware would redirect/403 and the browser would block the real request on CORS. The middleware now short-circuits `OPTIONS` requests, responding `204` with the CORS headers for `https://extensions.shopifycdn.com`.
