import {shopifyApp, BillingInterval} from '@shopify/shopify-app-remix/server';

export const MONTHLY_PLAN = 'Monthly subscription';
export const ANNUAL_PLAN = 'Annual subscription';

const shopify = shopifyApp({
  // ...etc
  billing: {
    [MONTHLY_PLAN]: {
      amount: 5,
      currencyCode: 'USD',
      interval: BillingInterval.Every30Days,
    },
    [ANNUAL_PLAN]: {
      amount: 50,
      currencyCode: 'USD',
      interval: BillingInterval.Annual,
    },
  },
});
export default shopify;
export const authenticate = shopify.authenticate;
