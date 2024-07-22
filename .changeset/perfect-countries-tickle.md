---
'@shopify/shopify-api': minor
---

Added a new future flag `unstable_managedPricingSupport`, which will:

- Change `billing.check` to always return an object.
- Change `billing.check` and `billing.subscription` to work without a billing config.
- Allow finding charges for apps using [Shopify managed pricing](https://shopify.dev/docs/apps/launch/billing/managed-pricing) by calling the billing `check` function without a `plans` filter.
