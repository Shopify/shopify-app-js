# `@shopify/shopify-app-react-router`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-app-react-router.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-app-react-router)

This package makes it easy to use [React Router](https://reactrouter.com/) to build Shopify apps.

## Getting started

Please follow this [quick start guide](https://github.com/Shopify/shopify-app-template-react-router#quick-start) to get started.

## Migrating from Remix

Use the [migration guide](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix) to migrate from the Shopify App Remix template.

## Resources

Getting started:

- [React Router docs](https://reactrouter.com/home)
- [Build a Shopify app](https://shopify.dev/docs/apps/build/build)
- [shopify-app-react-router documentation](https://shopify.dev/docs/api/shopify-app-react-router)

Shopify:

- [Intro to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge-library).
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/using-polaris-components).
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)

## Testing your app

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

For solutions to common issues refer to the [troubleshooting documentation](https://github.com/Shopify/shopify-app-template-react-router#gotchas--troubleshooting) for the solution to common issues.
