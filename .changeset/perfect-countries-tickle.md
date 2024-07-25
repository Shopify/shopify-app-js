---
'@shopify/shopify-api': minor
---

Added a new future flag `unstable_managedPricingSupport` to support apps using [Shopify managed pricing](https://shopify.dev/docs/apps/launch/billing/managed-pricing), which will:

- Change `billing.check` to always return an object.
- Change `billing.check` and `billing.subscription` to work without a billing config.
- Allow calling charges with `billing.check` without a `plans` filter. The `hasActivePayment` value will be true if any purchases are found with the given filters.
