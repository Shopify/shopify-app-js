# `shopify.app()`

This function creates an Express middleware that contains the endpoints necessary to authenticate apps with Shopify and to process webhooks from Shopify.

When setting up the OAuth component, it will redirect to the app within Shopify when OAuth completes, unless the `afterAuth` callback triggers a different redirect.

## Parameters

### `afterAuth`

`Function`

Callback called after OAuth completes to enable custom app behaviour. Receives an object with the following parameters:

- `req`: `express.Request`
- `res`: `express.Response`
- `session`: `Session`

> **Note**: by default, the app will return to your `/` route, but you can redirect to a different address in `afterAuth`.

### `webhookHandlers`

`{[topic: string]: WebhookHandler | WebhookHandler[]}`

Defines the webhooks your app will listen to, and how to handle them. See [the `@shopify/shopify-api` documentation](https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md) for the allowed values.

> **Note**: for HTTP webhook handlers, the `callbackUrl` value isn't used because this package handles setting it. You can ignore it.

## Examples

### Example - setting up OAuth with afterAuth callback

For example, the following callback will check for and request payment after OAuth if the merchant hasn't paid for the app yet.

```ts
const shopify = shopifyApp({
  /* ... */
});

const afterAuth = async ({req, res, session}) => {
  const hasPayment = await shopify.api.billing.check({
    session,
    plans: ['My plan'],
    isTest: true,
  });

  if (!hasPayment) {
    res.redirect(
      await shopify.api.billing.request({
        session,
        plan: 'My plan',
        isTest: true,
      }),
    );
  }
};

app.use('/shopify', shopify.app({afterAuth}));
```

### Example - setting up webhook handlers

The following example shows how to setup handlers for the mandatory GDPR webhooks.

```ts
const {DeliveryMethod} = require('@shopify/shopify-api');

const shopify = shopifyApp({
  /* ... */
});

const webhookHandlers = {
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callback: async (topic, shop, body) => {
      const payload = JSON.parse(body);
      // prepare customers data to send to customer
    },
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callback: async (topic, shop, body) => {
      const payload = JSON.parse(body);
      // remove customers data
    },
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callback: async (topic, shop, body) => {
      const payload = JSON.parse(body);
      // remove shop data
    },
  },
};

app.use('/shopify', shopify.app({webhookHandlers}));
```
