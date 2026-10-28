---
"@shopify/shopify-app-remix": patch
"@shopify/shopify-app-react-router": patch
---

Reject invalid admin session-token destination and issuer claims through the existing invalid-token response path before loading sessions or exchanging tokens. Checkout tokens no longer cause `TypeError: Invalid URL` in `authenticate.admin`; public checkout authentication is unchanged.
