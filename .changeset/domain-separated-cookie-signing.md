---
'@shopify/shopify-api': patch
---

Use a cookie-specific derived key when signing OAuth state and session cookies instead of signing them directly with the app API secret. This prevents signed OAuth state cookies from being reused as valid Shopify webhook HMACs. OAuth state values are also now generated with 32 random bytes encoded as hex.

Token-exchange-only flows that do not use signed OAuth/session cookies are not affected.
