---
'@shopify/shopify-app-remix': minor
---

Added `v4_removeRest` future flag. 

When `v4_removeRest` is `true`, the REST API will no longer be available. Please use the GraphQL API instead. See [Shopify is all-in on graphql](https://www.shopify.com/ca/partners/blog/all-in-on-graphql) for more information.

If your app doesn't use the REST API, you can safely set `v4_removeRest` to `true` and be ready for the next major release.  If your app does use the REST API, you should migrate to the GraphQL API and then set `v4_removeRest` to `true`.
