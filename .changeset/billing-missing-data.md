---
'@shopify/shopify-api': patch
---

Billing helpers now throw a `BillingError` that names the missing field when Shopify's response lacks the expected data. Before, `billing.check` and `billing.createUsageRecord` crashed with a `TypeError`, and `billing.cancel` and `billing.updateUsageCappedAmount` returned `null` or an object of `null` values. The `typescript/no-non-null-asserted-optional-chain` lint rule is enabled again.
