# shopify.webhooks.getTopicsAdded

Fetches all topics that were added to the registry. In most cases, you should use app-specific webhooks:

[App-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions). 

If you use only app-specific webhooks, you do not need to use `shopify.webhooks.getTopicsAdded`.

## Example

```ts
const topics = shopify.webhooks.getTopicsAdded();
// topics = ['PRODUCTS_CREATE', 'PRODUCTS_DELETE']
```

## Return

`string[]`

The added topics.

[Back to shopify.webhooks](./README.md)
