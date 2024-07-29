# Apps and middlewares

These packages provide tools for creating Shopify apps, either using pure TypeScript / JavaScript, or using a specific framework, like Remix or Express.

With them, you can create apps for the Shopify App Store or custom apps for merchants, get access tokens through OAuth, make requests to Shopify APIs, subscribe to webhooks, and more.

## Packages

| Package                                                        | Latest version                                                                                                                                      | Description                                                                            |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`@shopify/shopify-api`](./shopify-api#readme)                 | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-api/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-api)                 | Framework and runtime agnostic library for Shopify OAuth, APIs, webhooks, and more.    |
| [`@shopify/shopify-app-remix`](./shopify-app-remix#readme)     | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-remix/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-remix)     | Implementation of `@shopify/shopify-api` to make it easy to create apps using Remix.   |
| [`@shopify/shopify-app-express`](./shopify-app-express#readme) | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-express/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-express) | Implementation of `@shopify/shopify-api` to make it easy to create apps using Express. |

### Session storage packages

See the implementations of [`SessionStorage`](./session-storage) we provide.
