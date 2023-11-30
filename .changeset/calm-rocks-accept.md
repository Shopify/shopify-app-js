---
'@shopify/shopify-app-remix': patch
---

Fixing a bug in the GraphQL client that could cause specific builds to fail, because we used `query` for both the function and argument names.
