---
'@shopify/shopify-api': minor
---

# Standardize App Subscription returns on billing operations

Now all billing operations will return the same data, when returning App Subscriptions. Previously all operations returned the same type, but they underlying GraphQL requests returned different data. Now all operations will return the same data.

Now all billing operations will return the following information when returning `AppSubscriptions`

```js
export interface AppSubscription {
  /**
   * The ID of the app subscription.
   */
  id: string;
  /**
   * The name of the purchased plan.
   */
  name: string;
  /**
   * Whether this is a test subscription.
   */
  test: boolean;
  /**
   * The number of trial days for this subscription.
   */
  trialDays: number;
  /**
   * The date and time when the subscription was created.
   */
  createdAt: string;
  /**
   * The date and time when the current period ends.
   */
  currentPeriodEnd: string;
  /**
   * The return URL for this subscription.
   */
  returnUrl: string;

  /*
   * The line items for this plan. This will become mandatory in v10.
   */
  lineItems?: ActiveSubscriptionLineItem[];

  /*
   * The status of the subscription. [ACTIVE, CANCELLED, PENDING, DECLINED, EXPIRED, FROZEN, ACCEPTED]
   */
  status: string;
}
```
