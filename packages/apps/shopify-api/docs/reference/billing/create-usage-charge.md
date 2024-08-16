# shopify.billing.createUsageRecord

Creates a usage record for a usage billing plan.

## Example

### Create a usage record for usage billing plan given an ID

The call to `createUsageRecord` will return an `UsageRecord` object, containing the details of the usage record just created successfully, and will throw a `BillingError` if any errors occur.

```ts
  const chargeBilling = await billing.createUsageRecord({
    description: "Usage record for product creation",
    price: {
      amount: 1,
      currencyCode: "USD",
    },
    isTest: true,
    subscriptionLineItemId: "gid://shopify/AppSubscriptionLineItem/1234567890",
  });
  console.log(chargeBilling);
```

### Create a usage record for a usage billing plan without a subscription line item ID

If no subscription line item ID is provided, the usage record will be created on the currently active usage plan.

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
