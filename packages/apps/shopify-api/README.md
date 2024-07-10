# `@shopify/shopify-api`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](../../../LICENSE.md)
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-api.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-api)

This library provides support for the backends of TypeScript/JavaScript [Shopify](https://www.shopify.com) apps to access the [Shopify Admin API](https://shopify.dev/docs/api/admin), by making it easier to perform the following actions:

- Creating [online](https://shopify.dev/docs/apps/auth/access-token-types/online) or [offline](https://shopify.dev/docs/apps/auth/access-token-types/offline) access tokens for the Admin API via OAuth
- Making requests to the [REST API](https://shopify.dev/docs/api/admin/rest/reference)
- Making requests to the [GraphQL API](https://shopify.dev/docs/api/admin/graphql/reference)
- Register/process webhooks

Once your app has access to the Admin API, you can also access the [Shopify Storefront API](https://shopify.dev/docs/api/storefront) to run GraphQL queries using the `unauthenticated_*` access scopes.

This library can be used in any application that runs on one of the supported runtimes. It doesn't rely on any specific framework, so you can include it alongside your preferred stack and only use the features that you need to build your app.

**Note**: this package will enable your app's backend to work with Shopify APIs, but you'll need to use [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) in your frontend if you're planning on embedding your app into the Shopify Admin.

## Requirements

To follow these usage guides, you will need to:

- have a basic understanding of [TypeScript](https://www.typescriptlang.org/)
- have a Shopify Partner account and development store
- _OR_ have a test store where you can create a private app
- have a private or custom app already set up in your test store or partner account
- use [ngrok](https://ngrok.com), in order to create a secure tunnel to your app running on your localhost
- add the `ngrok` URL and the appropriate redirect for your OAuth callback route to your app settings
- have a JavaScript package manager such as [yarn](https://yarnpkg.com) installed

## Getting started

To install this package, you can run this on your terminal:

```bash
# You can use your preferred Node package manager
yarn add @shopify/shopify-api
```

**Note**: throughout these docs, we'll provide some examples of how this library may be used in an app using the [Express.js](https://expressjs.com/) framework for simplicity, but you can use it with any framework you prefer, as mentioned before.

The first thing you need to import is the adapter for your app's runtime. This will internally set up the library to use the right defaults and behaviours for the runtime.

<div>Node.js

```ts
import '@shopify/shopify-api/adapters/node';
```

</div><div>CloudFlare Worker

```ts
import '@shopify/shopify-api/adapters/cf-worker';
```

</div>
</div><div>Generic runtimes that implement the <a href="https://developer.mozilla.org/en-US/docs/Web/API">Web API</a>

```ts
import '@shopify/shopify-api/adapters/web-api';
```

</div>

Next, configure the library - you'll need some values in advance:

- Your app's API key from [Partners dashboard](https://www.shopify.com/partners) (also called `Client ID`)
- Your app's API secret from Partners dashboard (also called `Client secret`)
- The [scopes](https://shopify.dev/docs/api/usage/access-scopes) you need for your app

Call `shopifyApi` ([see reference](./docs/reference/shopifyApi.md)) to create your library object before setting up your app itself:

```ts
import '@shopify/shopify-api/adapters/node';
import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';
import express from 'express';

const shopify = shopifyApi({
  // The next 4 values are typically read from environment variables for added security
  apiKey: 'APIKeyFromPartnersDashboard',
  apiSecretKey: 'APISecretFromPartnersDashboard',
  scopes: ['read_products'],
  hostName: 'ngrok-tunnel-address',
  ...
});

const app = express();
```

### Next steps

Once you configure your app, you can use this package to access the Shopify APIs.
See the [reference documentation](./docs/reference/README.md) for details on all the methods provided by this package.

See the specific documentation in the [Guides section](#guides) for high-level instructions on how to get API access tokens and use them to query the APIs.

As a general rule, apps will want to interact with the Admin API to fetch / submit data to Shopify.
To do that, apps will need to:

1. Create an Admin API access token by going through [the OAuth flow](docs/guides/oauth.md).
1. Set up its own endpoints to:
   1. [Fetch the current session](docs/guides/oauth.md#using-sessions) created in the OAuth process.
   1. Create a [REST](docs/reference/clients/Rest.md) or [GraphQL](docs/reference/clients/Graphql.md) API client.
   1. Use the client to query the appropriate [Admin API](https://shopify.dev/api/admin).

## Guides

- [Performing OAuth](docs/guides/oauth.md)
- [Storing sessions](docs/guides/session-storage.md)
- [Setting up webhooks](docs/guides/webhooks.md)
- [Using REST resources](docs/guides/rest-resources.md)
- [Using GraphQL types](docs/guides/graphql-types.md)
- [Configuring Billing](docs/guides/billing.md)
- [Adding custom runtimes](docs/guides/runtimes.md)
- [Customizing logging configuration](docs/guides/logger.md)
- [Setting up a custom store app](docs/guides/custom-store-app.md)

## Migrating to v6

Before v6, this library only worked on Node.js runtimes. It now supports multiple runtimes through the use of adapters, more of which can be added over time.
If an adapter for the runtime you wish to use doesn't exist, you can create your own adapter by implementing some key functions, or contribute a PR to this repository.

In addition to updating the library to work on different runtimes, we've also improved its public interface to make it easier for apps to load only the features they need from the library.
If you're upgrading an existing app on v5 or earlier, please see [the migration guide for v6](docs/migrating-to-v6.md).

## Testing

This library exports two helper methods through `@shopify/shopify-api/test-helpers` to simplify end-to-end testing: `setUpValidSession()` and `setUpValidRequest()`. These methods can be used together to fake authorization during end-to-end testing. `setUpValidSession()` creats a fake session, and `setUpValidRequest()` modifies Requests so that this library authorizes them against the fake session.

`setUpValidSession()` populates a provided SessionStorage with a fake but valid session to use in testing. The second parameter implements [Session](https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/docs/guides/session-storage.md#what-data-is-in-a-session-object), and is used to define the parameters of the Session object that's populated into the SessionStorage. All Session parameters are optional except `shop`. A companion helper method, `getShop()`, is exported to help generate a fake shop URL for the required `shop` parameter.

```ts
import prisma from '~/db.server';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { setUpValidSession } from '@shopify/shopify-api/test-helpers';

// set up test Session
const sessionStorage = new PrismaSessionStorage(prisma);
const session = await setUpValidSession(sessionStorage, {
  shop: getShop('test-shop');
});

... // complete testing here

// tear down test Session
sessionStorage.deleteSession(session.id);
```

When an end-to-end testing framework runs tests in parallel, and you need a separate Session with a unique `shop` parameter for each parallel process, you can modify the above code snipped to incorporate a unique process identifier into the shop name, for example:

```ts
...

const session = await setUpValidSession(sessionStorage, {
  shop: getShop(`test-shop-${process.env.TEST_PARALLEL_INDEX}`),
});

...
```

`setUpValidRequest()` duplicates and decorates a provided Request object with authorization parameters to use in testing. The first parameter determines the authorization method to fake, and provides any inputs required to fake the authorization. There are four authorization methods that can be faked:
1. Admin: This authorization method is used by Shopify when making HTTP GET request to your app through the Shopify Admin interface. It appends authorization parameters to the query string of the URL.
1. Bearer: This authorization method is used by App Bridge when your app's front-end makes `fetch` requests to your app's back-end. It appends an `authorization` header to the [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).
1. Extension: This authorization method is used by Shopify when making HTTP POST requests to your app extension. It appends authorization headers to the [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).
1. Public: This authorization method is used by Shopify when making requests to an [app proxy](https://shopify.dev/docs/apps/build/online-store/display-dynamic-data#handling-proxy-requests). It appends a `signature` query string parameter to the URL.

Each of these four authorization methods matches an enumerated value on `RequestType`. `RequestType` is exported as a companion to this method.

```ts
import {
  RequestType,
  setUpValidRequest,
} from '@shopify/shopify-api/test-helpers';

if (typeof process.env.SHOPIFY_API_SECRET === 'undefined') { // narrow type or throw error if undefined
  throw new Error('Required environmental variable SHOPIFY_API_SECRET is undefined');
}

if (typeof process.env.SHOPIFY_API_KEY === 'undefined') { // narrow type or throw error if undefined
  throw new Error('Required environmental variable SHOPIFY_API_KEY is undefined');
}

let request: Request = ... // the request intercepted by end-to-end testing framework

const authorizedRequest = setUpValidRequest(
  {
    type: RequestType.Extension,
    store: `test-shop-${process.env.TEST_PARALLEL_INDEX}`,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
  },
  request
);

// now use authorizedRequest to complete the request, or if that's not possible, use it to modify the original request, using your testing framework's methods to add the headers or query string parameters to the request
```

### Troubleshooting
Most end-to-end testing frameworks run their tests in different environments to the environment in which the Shopify development server is started, so the test environments don't have access to the environmental variables set by the Shopify CLI when running `shopify app dev`. If this is true for your testing framework, you must manually set the values for the `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` environmental variables such that they are the same value in both the Shopify development server environment and the test environment(s).

For example, using Playwright, you can set the environment variable in `playwright.config.ts`, and its value will be the same in all environments.