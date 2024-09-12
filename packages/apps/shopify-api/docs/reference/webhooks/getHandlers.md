# shopify.webhooks.getHandlers

Fetches the configured handlers for shop-specific webhooks for the given topic. In most cases, you should use app-specific webhooks:

[App-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions).

If you use only app-specific webhooks, you do not need to use `shopify.webhooks.getHandlers`.

## Example

```ts
const handlers = shopify.webhooks.getHandlers('PRODUCTS_CREATE');
// e.g. handlers[0].deliveryMethod
```

## Parameters

### topic

`string` | :exclamation: required

The topic to search for.

## Return

`WebhookHandler[]`

The list of webhook handlers configured for that topic.

[Back to shopify.webhooks](./README.md)
