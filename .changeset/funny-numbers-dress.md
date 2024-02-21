---
"@shopify/shopify-app-remix": minor
---

Add new v3_lineItemBilling future flag

With this future flag you can configure billing plans to have multiple line items, eg. a recurring plan and a usage based plan.

```ts
//shopify.server.ts
import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";

export const MONTHLY_PLAN = 'Monthly subscription';
export const ANNUAL_PLAN = 'Annual subscription';

const shopify = shopifyApp({
  // ...etc
  billing: {
    [MONTHLY_PLAN]: {
      lineItems: [
       {
         amount: 5,
         currencyCode: 'USD',
         interval: BillingInterval.Every30Days,
        }
        {
            amount: 1,
            currencyCode: 'USD',
            interval: BillingInterval.Usage
            terms: "1 dollar per 1000 emails",
        }
      ],
    },
  },
  future: {v3_lineItemBilling: true}
});
export default shopify;
export const authenticate = shopify.authenticate;

```
