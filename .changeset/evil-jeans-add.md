---
'@shopify/shopify-api': major
---

Removed the `v10_lineItemBilling` and `lineItemBilling` future flags.  

## If you've adopted either flag

If you have already adopted either of these flags you only need to remove the flags from your shopifyApi config.

Before

```ts
import {
  shopifyApi,
} from '@shopify/shopify-api';

const shopify = shopifyApi({
  future: {
    lineItemBilling: true // Or v10_lineItemBilling: true
  }
  // ...
});
```

After:

```ts
import {
  shopifyApi,
} from '@shopify/shopify-api';

const shopify = shopifyApi({
  // ...
});
```

## If you have not adopted either flag

If your shopifyApi config does not contain `future.lineItemBilling` or `future.v10_lineItemBilling` you need may need to change your billing configs:

Before:

```ts
const shopify = shopifyApi({
  // ...
  billing: {
    'My billing plan': {
      interval: BillingInterval.Every30Days,
      amount: 30,
      currencyCode: 'USD',
      replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
      discount: {
        durationLimitInIntervals: 3,
        value: {
          amount: 10,
        },
      },
    },
  },
});
```

After:

```ts
const shopify = shopifyApi({
  // ...
  billing: {
    'My billing plan': {
      replacementBehavior: BillingReplacementBehavior.ApplyImmediately,
      lineItems: [
        {
          interval: BillingInterval.Every30Days,
          amount: 30,
          currencyCode: 'USD',
          discount: {
            durationLimitInIntervals: 3,
            value: {
              amount: 10,
            },
          },
        }
      ]
    },
  },
});
```
