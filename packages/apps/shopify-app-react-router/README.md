# `@shopify/shopify-app-react-router`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-app-react-router.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-app-react-router)

This package makes it easy to use [Remix](https://remix.run/) to build Shopify apps.
It builds on the `@shopify/shopify-api` package and exposes a `shopifyApp` function. You can use `shopifyApp` to configure your app and then authenticate requests from Shopify.

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-react-router) for more details on the React Router app package.

## Requirements

To use this package, you will need to have:

- a [Shopify Partner account](https://www.shopify.com/ca/partners) or the [Shopify Dev Dashboard](https://shopify.dev/beta/next-gen-dev-platform/dev-dashboard)
- The [Shopify CLI](https://shopify.dev/docs/apps/build/cli-for-apps) installed

## Getting started

### Shopify CLI

The easiest way to get started with developing Shopify apps is using the [Shopify CLI](https://shopify.dev/docs/apps/build/cli-for-apps).
It helps you set up your environment for developing and publishing your apps and extensions.

We strongly recommend using the CLI to create and manage your Shopify React Router apps and extensions!
Refer to the [getting started documentation](https://shopify.dev/docs/apps/build/scaffold-app) to create your app using the Shopify CLI.

### Migrating from Remix
If you are migrating from the Shopify App Remix template or the @shopify/shopify-app-remix package, you can use the [migration guide]() to help you migrate your app.

### Using your own React Router app

The Shopify CLI will clone a ready-made Shopify App React Router template but  this package works with any React Router app. If you're starting an app from scratch, then you can create a brand new React Router app that uses the indie-stack:



## Next steps

Once your app is up and running, you can start using this package to interact with Shopify APIs, webhooks and more.

Here are some guides to help you set up your app:

- [Interacting with Shopify Admin](https://shopify.dev/docs/api/shopify-app-react-router/latest/guide-admin)
- [Subscribing to webhooks](https://shopify.dev/docs/api/shopify-app-react-router/latest/guide-webhooks)

You can also authenticate requests from surfaces other than the admin.
To see all supported methods, see [the `shopify.authenticate` object documentation](https://shopify.dev/docs/api/shopify-app-react-router/latest/authenticate).


### Testing your app

This package exports a helper method through `@shopify/shopify-app-react-router/test-helpers` to simplify testing: `testConfig()`. This method can be used to pass dummy configuration properties to `shopifyApp()`.

If your testing framework supports setting environment variables, we recommend using an environment variable, for example "SHOPIFY_TESTING" to replace your default config with the config returned from `testConfig()`.

```ts
// my-app/app/shopify.server.ts
import { testConfig } from "@shopify/shopify-app-react-router/test-helpers";
...
const config = {
  ...
};

if (process.env.SHOPIFY_TESTING) {
  Object.assign(config, testConfig());
}

const shopify = shopifyApp(config);
...
```

`testConfig()` accepts a config object as an optional parameter. The config values provided override the default config values returned by `testConfig()`. This is especially useful for integration testing and end-to-end testing to ensure `shopifyApp()` reads the sessions from the development database.

```ts
// my-app/app/shopify.server.ts
import { testConfig } from "@shopify/shopify-app-react-router/test-helpers";
...
const sessionStorage = new PrismaSessionStorage(prisma);
const config = {
  ...
  sessionStorage,
  ...
};

if (process.env.SHOPIFY_TESTING) {
  Object.assign(config, testConfig());
}

if (process.env.SHOPIFY_TESTING === "e2e") {
  Object.assign(config, testConfig({ sessionStorage }));
}
...
```

## Gotchas / Troubleshooting

For solutions to common issues that you may run into while developing a Shopify app, refer to the [troubleshooting documentation](https://github.com/Shopify/shopify-app-template-react-router#gotchas--troubleshooting) for the solution to common issues.
