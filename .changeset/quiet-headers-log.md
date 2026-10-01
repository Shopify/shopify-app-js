---
'@shopify/graphql-client': patch
'@shopify/admin-api-client': patch
'@shopify/storefront-api-client': patch
---

Redact credential headers from request params passed to the client `logger`. Logger events now show `****` for the `Authorization`, `Cookie`, `Set-Cookie`, `X-Shopify-Access-Token`, `Shopify-Storefront-Private-Token` and `X-Shopify-Storefront-Access-Token` header values. The headers sent with the request are unchanged.
