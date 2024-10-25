---
'@shopify/shopify-app-remix': minor
---

Adds API to update the capped amount for a usage billing plan.

A new billing helper function has been added to update the capped amount for a usage billing plan. This function redirects to a confirmation page where the merchant can confirm the update.

```ts
await billing.updateUsageCappedAmount({
  subscriptionLineItemId: "SUBSCRIPTION_LINE_ITEM_ID",
  cappedAmount: {
    amount: 10,
    currencyCode: "USD"
  },
});
```

Learn more about [App Billing](https://shopify.dev/docs/apps/launch/billing/subscription-billing).