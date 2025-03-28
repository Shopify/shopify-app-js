# Implementing Managed Pricing with `shopify-app-express`

[Managed app pricing](https://shopify.dev/docs/apps/launch/billing/managed-pricing) lets you define your app’s pricing plans directly in the Shopify Partner Dashboard, without needing to use the Billing API. Shopify hosts your app’s plan selection page, and automates most common billing tasks, such as recurring charges, free trials, proration, test charges, and price updates.

For most developers, managed pricing is simpler and more consistent than coding your own billing logic using the Billing API.

## Prerequisites

* Complete the [set up for managed pricing](https://shopify.dev/docs/apps/launch/billing/managed-pricing#set-up-managed-pricing) in the Shopify Partner Dashboard.
* Enable the `unstable_enableManagedPricing` flag in your app.

```js
const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true, // enable managed pricing
    },
    billing: undefined, // billing is not needed for managed pricing
  },
```

## Implementing Managed Pricing

Managed pricing works in a similar flow to using the billing API.

1. Check if the customer has an active payment.
2. Redirect the customer to the plan selection page if they don't have an active payment.

```js
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),

  async (req, res, next) => {
    const session = res.locals.shopify.session;
    const hasPayment = await shopify.api.billing.check(
      {
        session,
        isTest: true,
        plans: [],
        returnObject: true,
      }
    );
    const shopHandle = res.locals.shopify.session.shop.replace('.myshopify.com', '');
    const appHandle = 'node-managed-pricing' // found in your shopify.app.toml file

    if (hasPayment.hasActivePayment) {
      next();
    } else {
      shopify.redirectOutOfApp({
        res,
        redirectUri: `https://admin.shopify.com/store/${shopHandle}/charges/${appHandle}/pricing_plans`,
        shop: res.locals.shopify.shop,
        req,
      });
    }
  },


  shopify.redirectToShopifyOrAppRoot()
);
```