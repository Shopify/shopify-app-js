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

## Parameters

Receives an object containing:

### session

`Session` | :exclamation: required

The `Session` for the current request.

### description

`string` | :exclamation: required

A description of the usage record.

### price.amount

`number` | :exclamation: required

The amount of the usage record.

### price.currencyCode

`string` | :exclamation: required

The currency code of the usage record.

### subscriptionLineItemId

`string` | optional

The id for the subscription line item to create the usage record for. If not provided, the usage record will be created on the currently active usage plan.

### idempotencyKey

`string` | optional

A unique key to ensure idempotency of the request.

### isTest

`boolean` | optional, defaults to `true`

## Returns

`UsageRecord`


### id

`string`

The id of the usage record.

### description

`string`

The description of the usage record.

### price.amount

`number`

The amount of the usage record.

### price.currencyCode

`string`

The currency code of the usage record.

### idempotencyKey

`string`

The idempotency key of the usage record.

### plan

`ActiveSubscriptionLineItem`
