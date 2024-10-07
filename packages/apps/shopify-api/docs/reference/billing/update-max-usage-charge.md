# shopify.billing.updateMaxUsageCharge

Updates the maximum charge for a usage billing plan.

## Example

### Update the maximum charge for a usage billing plan

```ts
const response = await shopify.billing.updateMaxUsageCharge({
  session,
  subscriptionLineItemId: 'gid://shopify/AppSubscriptionLineItem/1234567890',
  cappedAmount: {
    amount: 100,
    currencyCode: 'USD',
  },
});
```
