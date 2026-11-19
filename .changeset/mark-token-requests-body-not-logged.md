---
'@shopify/shopify-api': patch
---

Keep the request body of OAuth token endpoint calls out of HTTP debug logs whatever the endpoint URL looks like: each OAuth helper now marks its token request so that the body is never logged.
