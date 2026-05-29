---
'@shopify/shopify-app-express': patch
---

Respond to CORS preflight `OPTIONS` requests in `validateAuthenticatedSession` by setting CORS headers and returning `204`, instead of running them through the authentication flow. Preflight requests don't carry a session token, so authenticating them always failed and redirected to auth, breaking authenticated fetches from admin extensions.
