---
'@shopify/shopify-app-remix': minor
---

Make session storage optional for merchant custom apps

Providing a session storage to the `shopifyApp()` function is now optional for apps with a distribution of `AppDistribution.ShopifyAdmin`. Apps with this distribution create the session from the configured access tokens.
