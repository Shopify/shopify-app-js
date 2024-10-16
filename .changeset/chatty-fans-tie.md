---
'@shopify/shopify-api': minor
---

Adds API to update the capped amount for a usage billing plan.

A new billing helper function has been added to update the capped amount for a usage billing plan.

```ts
const response = await shopify.billing.updateUsageCappedAmount({
  session,
  subscriptionLineItemId: 'gid://shopify/AppSubscriptionLineItem/1234567890',
  cappedAmount: {
    amount: 100,
    currencyCode: 'USD',
  },
});
console.log(response);
```

Learn more about [App Billing](https://shopify.dev/docs/apps/launch/billing/subscription-billing).
