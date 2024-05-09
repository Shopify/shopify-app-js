---
"@shopify/shopify-api": patch
---

Handle empty responses to REST requests for DELETE endpoints gracefully, instead of throwing an error when parsing the JSON.
