# `@shopify/shopify-app-express`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-app-express.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-app-express)

This package makes it easy for [Express.js](https://expressjs.com/) apps to integrate with Shopify.
It builds on the `@shopify/shopify-api` package and creates a middleware layer that allows the app to communicate with and authenticate requests from Shopify.

> **Note**: this package will enable your app's backend to work with Shopify APIs, and by default it will behave as an [embedded app](https://shopify.dev/docs/apps/auth/oauth/session-tokens). You'll need to use [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) in your frontend to authenticate requests to the backend.

## Requirements

To follow these usage guides, you will need to:

- have a Shopify Partner account and development store
- have an app already set up on your partner account
- have a JavaScript package manager such as [yarn](https://yarnpkg.com) installed
- have [Express.js](https://expressjs.com/) v5 or later installed (`express@^5.0.0`)

## Getting started

To install this package, you can run this on your terminal:

```bash
# Create your project folder
mkdir /my/project/path
# Set up a new yarn project
yarn init .
# You can use your preferred Node package manager
yarn add @shopify/shopify-app-express
```

Then, you can import the package in your app by creating an `index.js` file containing:

```ts
const express = require('express');
const {shopifyApp} = require('@shopify/shopify-app-express');

const PORT = 8080;

const shopify = shopifyApp({
  api: {
    apiKey: 'ApiKeyFromPartnersDashboard',
    apiSecretKey: 'ApiSecretKeyFromPartnersDashboard',
    scopes: ['your_scopes'],
    hostScheme: 'http',
    hostName: `localhost:${PORT}`,
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
});

const app = express();

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);
// Shop-specific webhook subscriptions — see the Webhooks section below.
// For most apps, app-specific subscriptions configured in shopify.app.toml are recommended instead.
// https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({webhookHandlers}),
);

app.get('/', shopify.ensureInstalledOnShop(), (req, res) => {
  res.send('Hello world!');
});

app.listen(PORT, () => console.log('Server started'));
```

Once you set the appropriate configuration values, you can then run your Express app as usual, for instance using:

```bash
node ./index.js
```

To load your app within the Shopify Admin app, you need to:

1. Update your app's URL in your Partners Dashboard app setup page to `http://localhost:8080`
1. Update your app's callback URL to `http://localhost:8080/api/auth/callback` in that same page
1. Go to **Test your app** in Partners Dashboard and select your development store

## Environment variables

The following environment variables are automatically read as defaults when they are not explicitly provided in the `api` config object passed to `shopifyApp()`:

| Variable           | Maps to config field       | Description                                                  |
| ------------------ | -------------------------- | ------------------------------------------------------------ |
| `SHOPIFY_API_KEY`  | `apiKey`                   | Your app's API key from the Partners Dashboard               |
| `SHOPIFY_API_SECRET` | `apiSecretKey`           | Your app's API secret from the Partners Dashboard            |
| `HOST`             | `hostScheme` / `hostName`  | Your app's public URL (e.g. `https://my-app.example.com`)   |
| `SCOPES`           | `scopes`                   | Comma-separated list of OAuth scopes (e.g. `read_products,write_orders`) |

For example, if you set these environment variables:

```bash
SHOPIFY_API_KEY=mykey
SHOPIFY_API_SECRET=mysecret
HOST=https://my-app.example.com
SCOPES=read_products,write_orders
```

Then you can omit them from the config:

```ts
const shopify = shopifyApp({
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
});
```

Any values explicitly passed in the `api` config will take precedence over the environment variables.

## Webhooks

Shopify supports two ways to subscribe to webhooks: **app-specific** and **shop-specific**. For most apps, app-specific subscriptions are the recommended approach. See [App-specific vs shop-specific subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions) for a full comparison.

### Shop-specific reconciliation behavior

When `shopify.auth.callback()` completes an offline OAuth session, it automatically calls `register()` to reconcile the store's shop-specific webhook subscriptions with the handlers declared in `webhookHandlers`.

**`register()` will delete any shop-specific webhook subscriptions that are not present in `webhookHandlers`.** App-specific subscriptions (configured in `shopify.app.toml`) are not affected.

This means **all shop-specific webhook topics your app relies on must be declared in `webhookHandlers`**:

```ts
const webhookHandlers = {
  PRODUCTS_UPDATE: [{
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleProductsUpdate,
  }],
  // All other shop-specific topics your app uses must be listed here.
  // Any topic not listed will be unsubscribed from the store on next OAuth.
};

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({webhookHandlers}),
);
```

If you are **migrating from a custom implementation or another library**, make sure to declare all of your existing webhook topics in `webhookHandlers` before your app goes through OAuth, or those subscriptions will be deleted.

#### Migrating from shop-specific to app-specific

If you are switching from shop-specific to app-specific subscriptions, remove existing shop-specific subscriptions for the same topics first. Having both types subscribed to the same topic will result in duplicate webhook deliveries. See [the Shopify documentation](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions) for more details.

## Next steps

Now that your app is up and running, you can learn more about the `shopifyApp` object in [the reference docs](./docs/reference/shopifyApp.md).
