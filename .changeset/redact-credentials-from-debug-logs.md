---
'@shopify/shopify-api': patch
---

Redact OAuth credentials from HTTP debug logs. The request body of OAuth token endpoint calls is no longer written to the debug log, and credential headers (`Authorization`, `Cookie`, `Set-Cookie`, `X-Shopify-Access-Token`, `Shopify-Storefront-Private-Token`, `X-Shopify-Storefront-Access-Token`) are replaced with `****` in API client debug logs.
