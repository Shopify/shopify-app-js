---
'@shopify/shopify-app-react-router': minor
---

Require Node >= v20. Remove crypto dependency in favor of globalThis.crypto

**Note:** Technically this is a breaking change. However, React Router and the [Shopify app template for React Router](https://github.com/Shopify/shopify-app-template-react-router) already require Node 20. So we don't think this will affect anyone.  Semver allows V0 packages can have breaking changes without major version bumps. 

If you are using Node, make sure you are using Node version 20 or above

If you are using `setCrypto` from `'@shopify/shopify-api'` you can remove this code.
