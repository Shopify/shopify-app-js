# `shopify.processWebhooks()`

This function creates an Express middleware that processes webhook requests from Shopify, based on the given handlers.

It mounts the handlers onto the `shopify` object, and they're registered in `shopify.auth.callback` after we receive an access token to call the API.

This middleware will always respond to Shopify, even if there was an error while handling the webhook.

:exclamation: **Important**: Shopify always sends POST requests for webhooks.
Make sure you use this middleware on a `.post()` route.

## Parameters

### `webhookHandlers`

`{[topic: string]: WebhookHandler | WebhookHandler[]}`

Defines the webhooks your app will listen to, and how to handle them. See [the `@shopify/shopify-api` documentation](https://github.com/Shopify/shopify-api-js/blob/main/docs/guides/webhooks.md) for the allowed values.

> **Note**: for HTTP webhook handlers, the `callbackUrl` value must match the route where you use this middleware.

## Example

The following example shows how to setup handlers for the mandatory GDPR webhooks.

```ts
const {DeliveryMethod} = require('@shopify/shopify-api');

const shopify = shopifyApp({
  webhooks: {
    path: '/webhooks',
  },
});

const webhookHandlers = {
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    callback: async (topic, shop, body, webhookId, apiVersion) => {
      const payload = JSON.parse(body);
      // prepare customers data to send to customer
    },
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    callback: async (topic, shop, body) => {
      const payload = JSON.parse(body);
      // remove customers data
    },
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    callback: async (topic, shop, body, webhookId, apiVersion) => {
      const payload = JSON.parse(body);
      // remove shop data
    },
  },
};

// This must be a .post() endpoint
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({webhookHandlers}),
);
```
