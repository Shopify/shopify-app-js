# `shopify.auth`

This object contains two express middleware functions: `begin` and `callback`.

When setting up the OAuth routes, the app must redirect the user to the appropriate location.
By default, we recommend using the `shopify.redirectToShopifyOrAppRoot` middleware to load your app in the correct location, but you can choose to redirect anywhere else.

## Properties

### `begin`

`() => RequestHandler`

This function returns an Express middleware that initiates an OAuth process with Shopify, by requesting the merchant to approve the selected scopes.
It doesn't take any arguments, but the route that uses this middleware must match the configuration in `auth.path`.

### `callback`

`() => RequestHandler`

This function returns an Express middleware that completes an OAuth process with Shopify, by validating that the call originated from Shopify and storing a `Session` in the database.

The session is available to the following handlers via the `res.locals.shopify.session` object.

> **Note**: this middleware **_DOES NOT_** redirect anywhere, so the request **_WILL NOT_** trigger a response by default. If you don't need to perform any actions after OAuth, we recommend using the `shopify.redirectToShopifyOrAppRoot()` middleware.

## Example

For example, the following callback will check for and request payment after OAuth if the merchant hasn't paid for the app yet.

```ts
const shopify = shopifyApp({
  api: {
    billing: {
      'My plan': {
        amount: 10,
        currencyCode: 'USD',
        interval: BillingInterval.Every30Days,
      },
    },
  },
  auth: {
    path: '/auth',
    callbackPath: '/auth/callback',
  },
});

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  // Request payment if required
  async (req, res, next) => {
    const session = res.locals.shopify.session;
    const hasPayment = await shopify.api.billing.check({
      session,
      plans: ['My plan'],
      isTest: true,
    });

    if (hasPayment) {
      next();
    } else {
      res.redirect(
        await shopify.api.billing.request({
          session,
          plan: 'My plan',
          isTest: true,
        }),
      );
    }
  },
  // Load the app otherwise
  shopify.redirectToShopifyOrAppRoot(),
);
```
