---
'@shopify/shopify-api': patch
'@shopify/shopify-app-react-router': patch
'@shopify/shopify-app-remix': patch
---

Harden app proxy authentication by rejecting repeated security parameters while preserving repeated application query parameters. App proxy HMAC validation now consumes structured URL search parameters in the shared API package.
