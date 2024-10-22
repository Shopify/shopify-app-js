# shopify.billing.updateUsageCappedAmount

Updates the capped amount for a usage billing plan.

## Example

### Update the capped amount for a usage billing plan

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

## Parameters

Receives an object containing:

### session

`Session` | :exclamation: required

The `Session` for the current request.

### subscriptionLineItemId

`string` | :exclamation: required

The ID of the subscription line item to update.

### cappedAmount.amount

`number` | :exclamation: required

The new capped amount for the usage billing plan.

### cappedAmount.currencyCode

`string` | :exclamation: required

The currency code for the capped amount.

## Returns

### confirmationUrl

`string`

A URL to confirm the update to the capped amount for the usage billing plan.

### appSubscription

`AppSubscription`

The previous subscription details.
