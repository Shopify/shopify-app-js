---
'@shopify/shopify-app-express': major
---

Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for details.

⚠️ [Breaking] Refer to the [6 to 7 migration guide](https://github.com/Shopify/shopify-api-js/blob/main/docs/migrating-to-v7.md) for more details on how the `.api` property returned by `shopifyApp` may be impacted by this release of the API library.

⚠️ [Breaking] If your app is using the logging methods of the `.config.logger` property returned by `shopifyApp`, it is no longer `async`.
