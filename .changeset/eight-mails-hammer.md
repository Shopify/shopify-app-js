---
'@shopify/shopify-app-remix': minor
---

Added `removeRest` future flag. 

When `removeRest` is `true`, the REST API will no longer be available. Please use the GraphQL API instead. See [Shopify is all-in on graphql](https://www.shopify.com/ca/partners/blog/all-in-on-graphql) for more information.

If your app doesn't use the REST API, you can safely set `removeRest` to `true` and be ready for a future major release.  If your app does use the REST API, you should migrate to the GraphQL API and then set `removeRest` to `true`.
