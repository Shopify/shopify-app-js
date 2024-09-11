# shopify.webhooks

This object contains functions used to configure, register and process webhooks.

Most of these functions are used for interacting with shop-specific webhooks. Unless your app needs different webhooks for different shops, we recommend using [app-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) instead.  If you use only app-specific webhooks, the only method you will need is [shopify.webhooks.validate](./validate.md).

| Property                              | Description                                            | 
| ------------------------------------- | ------------------------------------------------------ |
| [addHandlers](./addHandlers.md)       | Add handlers to the webhook registry.                  |
| [getHandlers](./getHandlers.md)       | Get the configured handlers for the given topic.       |
| [getTopicsAdded](./getTopicsAdded.md) | Fetch the topics that have been added to the registry. |
| [process](./process.md)               | Validate and process a webhook request from Shopify.   |
| [register](./register.md)             | Register the configured handlers with Shopify.         |
| [validate](./validate.md)             | Validate a webhook request from Shopify.              |

[Back to shopifyApi](../shopifyApi.md)
