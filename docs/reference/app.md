# `shopify.app()`

This function creates an Express middleware that contains the endpoints necessary to authenticate apps with Shopify and to process webhooks from Shopify.

When setting up the OAuth component, it will redirect to the app within Shopify when OAuth completes, unless the `afterAuth` callback triggers a different redirect.

## Parameters

### `afterAuth()` - `Function`

Callback called after OAuth completes to enable custom app behaviour. Receives an object with the following parameters:

- `req`: `express.Request`
- `res`: `express.Response`
- `session`: `Session`

> **Note**: the above example doesn't have to trigger a redirect back to the app if payment exists - the package will do that by default.

### `webhookHandlers[]` - `Array`

Array of Webhook handlers ... TODO ... document the various types of Webhook handlers and their associated params.

## Examples

### Example - setting up OAuth with afterAuth callback

For example, the following callback will check for and request payment after OAuth if the merchant hasn't paid for the app yet.

```ts
const shopify = shopifyApp({//...config})

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

### Example - setting up webhooks handlers

The following example shows how to setup handlers for the mandatory GDPR webhooks.

```ts
const app = express();


const shopify = shopifyApp({// configuration...});

const GDPRWebhookHandlers = [
  {
    topic: "CUSTOMERS_DATA_REQUEST",
    handler: async (topic, shop, body) => {
      const payload = JSON.parse(body);
      // prepare customers data to send to customer
    },
  },
  {
    topic: "CUSTOMERS_REDACT",
    handler: async (topic, shop, body) => {
      const payload = JSON.parse(body);
      // remove customers data
    },
  },
  {
    topic: "SHOP_REDACT",
    handler: async (topic, shop, body) => {
      const payload = JSON.parse(body);
      // remove shop data
    },
  },
];

app.use('/shopify', shopify.app({handlers: GDPRWebhookHandlers}));
```
