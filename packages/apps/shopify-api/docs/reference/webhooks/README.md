# shopify.webhooks

This object contains functions used to configure, register and process webhooks.

Most of these functions are used for interacting with shop-specific webhooks. In most cases, you should use app-specific webhooks:

[App-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions)

If you only use app-specific webhooks, the only method you will need is [shopify.webhooks.validate](./validate.md).

| Property                              | Description                                            | 
| ------------------------------------- | ------------------------------------------------------ |
| [addHandlers](./addHandlers.md)       | Add handlers to the webhook registry.                  |
| [getHandlers](./getHandlers.md)       | Get the configured handlers for the given topic.       |
| [getTopicsAdded](./getTopicsAdded.md) | Fetch the topics that have been added to the registry. |
| [process](./process.md)               | Validate and process a webhook request from Shopify.   |
| [register](./register.md)             | Register the configured handlers with Shopify.         |
| [validate](./validate.md)             | Validate a webhook request from Shopify.              |

[Back to shopifyApi](../shopifyApi.md)
