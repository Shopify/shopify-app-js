---
'@shopify/shopify-app-express': major
'@shopify/shopify-api': patch
---

Updated `express` from v4 to v5 and `@types/express` from v4 to v5. This is a breaking change for `@shopify/shopify-app-express` as Express v5 includes breaking changes to route path syntax, request/response behavior, and other APIs. Added a null guard in `graphqlProxy` to handle `req.body` being `undefined` (Express 5 default).
