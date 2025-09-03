---
'@shopify/shopify-api': major
'@shopify/shopify-app-remix': major
'@shopify/shopify-app-react-router': major
---

Require Node >= v20. Remove crypto dependency in favor of globalThis.crypto

If you are using Node, make sure you are using Node version 20 or above

If you are using `setCrypto` from `'@shopify/shopify-api'` you can remove this code.
