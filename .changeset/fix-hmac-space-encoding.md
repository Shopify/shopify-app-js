---
"@shopify/shopify-api": patch
---

Fix HMAC verification failure when query parameter values contain spaces. `URLSearchParams.toString()` encodes spaces as `+` (application/x-www-form-urlencoded), but Shopify signs using percent-encoding (`%20`). The mismatch caused `api.utils.validateHmac()` to return `false` for valid requests with space-containing params.
