---
"@shopify/shopify-api": major
"@shopify/shopify-app-express": patch
"@shopify/shopify-app-remix": patch
---

This `scopes` field on the API config object is now optional. If your app is using the new [managed install flow](https://shopify.dev/docs/apps/auth/installation), it is now recommended you omit the `scopes` property from the config object.
