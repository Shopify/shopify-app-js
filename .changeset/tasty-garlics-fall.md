---
'@shopify/shopify-api': minor
---

# Add planHandle field

Add the new planHandle field that was introduced on [April 1](https://shopify.dev/changelog/new-planhandle-field-managed-pricing) in version [2025-04](https://shopify.dev/docs/api/admin-graphql/latest/objects/AppRecurringPricing#field-planhandle)

## Example Usage

```js
const {activeSubscriptions} = shopify.billing.check({
  session
});

const planHandle = appSubscriptions?.[0]?.lineItems?.[0]?.plan?.pricingDetails?.interval;
```
