---
'@shopify/shopify-app-remix': minor
'@shopify/shopify-api': minor
---

Adds API to create usage records for billing

A new billing helper function has been added to create usage records for a usage billing plan.

```ts
  const chargeBilling = await billing.createUsageRecord({
    description: "Usage record for product creation",
    price: {
      amount: 1,
      currencyCode: "USD",
    },
    isTest: true,
  });
  console.log(chargeBilling);
```

Learn more about [App Billing](https://shopify.dev/docs/apps/launch/billing/subscription-billing).
