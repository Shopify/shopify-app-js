---
'@shopify/shopify-api': patch
---

Fixed App Proxy signature validation failing for requests with query parameters whose locale order differs from code point order, such as `consentGiven` and `consented`.
