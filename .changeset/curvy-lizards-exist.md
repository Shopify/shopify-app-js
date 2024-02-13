---
"@shopify/shopify-app-express": patch
---

Return a 403 with X-Shopify headers on XHR requests for non-embedded apps, instead of a 302. The 302 ran into CORS errors and always failed.

These requests will return the following headers:

- `X-Shopify-Api-Request-Failure-Reauthorize`: `1`
- `X-Shopify-Api-Request-Failure-Reauthorize-Url`: <URL>
