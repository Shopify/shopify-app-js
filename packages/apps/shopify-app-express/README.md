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

## Next steps

Now that your app is up and running, you can learn more about the `shopifyApp` object in [the reference docs](./docs/reference/shopifyApp.md).
