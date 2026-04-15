# `shopify.processWebhooks()`

This function creates an Express middleware that processes webhook requests from Shopify, based on the given handlers.

It mounts the handlers onto the `shopify` object, and they're registered in `shopify.auth.callback` after we receive an access token to call the API.

This middleware will always respond to Shopify, even if there was an error while handling the webhook.

> **Note**: The `webhookHandlers` passed to this middleware define **shop-specific** webhook subscriptions, which are managed via the GraphQL Admin API. For most apps, [app-specific subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) configured in `shopify.app.toml` are the recommended approach since Shopify manages the subscription lifecycle for you. See the [Webhooks section in the README](../../README.md#webhooks) for guidance on choosing between the two.
>
> If you use app-specific subscriptions with HTTP delivery, you still need this middleware to receive and process the incoming payloads. You must register a handler callback for each topic you want to process — incoming webhooks for topics without a handler will receive a 404 response.

:exclamation: **Important**: Shopify always sends POST requests for webhooks.
Make sure you use this middleware on a `.post()` route.

## Parameters

### `webhookHandlers`

`{[topic: string]: WebhookHandler | WebhookHandler[]}`

Defines [shop-specific webhook subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe#shop-specific-subscriptions) your app will listen to, and how to handle them. Topics listed here are registered via the GraphQL Admin API during OAuth. See [the `@shopify/shopify-api` documentation](../../../shopify-api/docs/guides/webhooks.md) for the allowed values.

> **Note**: for HTTP webhook handlers, the `callbackUrl` value must match the route where you use this middleware.

## Example

The following example shows how to set up shop-specific handlers for the mandatory GDPR webhooks. These topics can also be configured as [app-specific subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) in `shopify.app.toml`.

```ts
const {ApiVersion, DeliveryMethod} = require('@shopify/shopify-api');

const shopify = shopifyApp({
  auth: {
    path: '/auth',
    callbackPath: '/auth/callback',
  },
  webhooks: {
    path: '/webhooks',
  },
  api: {
    apiVersion: ApiVersion.July25,
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
