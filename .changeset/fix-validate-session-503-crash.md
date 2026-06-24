---
"@shopify/shopify-app-express": patch
---

Fix server crash when Shopify returns 5xx errors during session token validation.

`validateAuthenticatedSession` now catches non-401 HTTP errors thrown by `hasValidAccessToken` (e.g. 503 Service Unavailable) and treats them as an invalid session, redirecting to re-authentication instead of crashing the server with an unhandled promise rejection.
