# `@shopify/shopify-app-express`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

<!--
Restore this once it's publised
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-app-express.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-app-express)
-->

This package makes it easy for [Express.js](https://expressjs.com/) apps to integrate with Shopify.
It builds on the `@shopify/shopify-api` package and creates a middleware layer that allows the app to communicate with and authenticate requests from Shopify.

> **Note**: this package will enable your app's backend to work with Shopify APIs, and by default it will behave as an [embedded app](https://shopify.dev/apps/auth/oauth/session-tokens). You'll need to use [Shopify App Bridge](https://shopify.dev/apps/tools/app-bridge) in your frontend to authenticate requests to the backend.

## Getting started

To install this package, you can run this on your terminal:

```bash
# You can use your preferred Node package manager
yarn add @shopify/shopify-app-express @shopify/shopify-api
```

Then, you can import the package in your app

```ts
import {shopifyApp} from '@shopify/shopify-app-express';
import express from 'express';

const PORT = 8080;

const shopify = shopifyApp({
  api: {
    apiKey: 'ApiKeyFromPartnersDashboard',
    apiSecretKey: 'ApiSecretKeyFromPartnersDashboard',
    scopes: ['your_scopes'],
    hostScheme: 'http',
    hostName: `localhost:${PORT}`,
  },
});
const app = express();

// Handles authenticating your app when you visit /api/auth
app.use('/api', shopify.app);

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.listen(PORT);
```

You can then run your Express app as usual, for instance using:

```bash
node ./index.js
```

And access `http://localhost:8080` in your browser to view your app.
