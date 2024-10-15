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

The new maximum charge amount for the usage billing plan.

### cappedAmount.currencyCode

`string` | :exclamation: required

The currency code for the maximum charge amount.

## Returns

`userErrors: {field: string, message: string}[]`

An array of user errors that occurred while updating the maximum charge for the usage billing plan.

### confirmationUrl

`string`

The URL to confirm the update to the maximum charge for the usage billing plan.

### appSubscription

`AppSubscription`

The previous subscription details.
