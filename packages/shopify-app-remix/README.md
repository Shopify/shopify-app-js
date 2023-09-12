# `@shopify/shopify-app-remix`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-app-remix.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-app-remix)

This package makes it easy to use [Remix](https://remix.run/) to build Shopify apps.
It builds on the `@shopify/shopify-api` package and exposes a `shopifyApp` function. You can use `shopifyApp` to configure your app and then authenticate requests from Shopify.

## Requirements

To follow these usage guides, you will need to:

- have a Shopify Partner account and development store
- have an app already set up on your partner account
- have a JavaScript package manager such as [yarn](https://yarnpkg.com) installed

## Getting started

### Shopify CLI

The easiest way to get started with developing Shopify apps is using the [Shopify CLI](https://shopify.dev/docs/apps/tools/cli).
It helps you set up your environment for developing and publishing your apps and extensions.

We strongly recommend using the CLI to create and manage your Remix apps and extensions!
Refer to the [getting started documentation](https://shopify.dev/docs/apps/getting-started/create) to create your app using the Shopify CLI.

### Using a plain Remix app

This package works with any Remix app. If you're starting an app from scratch, then you can create a brand new Remix app that uses the indie-stack:

```bash
npx create-remix@latest --template remix-run/indie-stack
cd ./name-of-your-app
```

Now let's install this package:

```bash
npm install @shopify/shopify-app-remix
```

Create `app/shopify.server.js`. We will use this file to configure our Shopify app:

```ts
// app/shopify.server.js
import '@shopify/shopify-app-remix/server/adapters/node';
import {LATEST_API_VERSION, shopifyApp} from '@shopify/shopify-app-remix';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ['read_products'],
  apiVersion: LATEST_API_VERSION,
});
export default shopify;
```

A description of these config options:

| option        | description                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey        | The Client ID for your app. Copy it from your app in the Shopify partners dashboard. This is public.                                                           |
| apiSecretKey  | The API Secret for your app. Copy it from your app in the Shopify partners dashboard. This is private. Do not commit this.                                     |
| appUrl        | This is the URL for your app.                                                                                                                                  |
| scopes        | What permissions your app needs. [More information](https://shopify.dev/docs/api/usage/access-scopes).                                                         |
| apiVersion    | What versions of the [Admin API's](https://shopify.dev/docs/api/) do you want to use. If you are creating anew app use LATEST_API_VERSION.                     |
| restResources | What version of the [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest) do you want to use. If you are creating anew app use LATEST_API_VERSION. |

This will require some environment variables. So let's create an `.env` file:

```env
SHOPIFY_API_KEY="[Copy from partners dashboard]"
SHOPIFY_API_SECRET="[Copy from partners dashboard]"
SHOPIFY_APP_URL="[The tunnel URL you are using to run your app]"
```

`shopifyApp` needs to reserve a [splat route](https://remix.run/docs/en/main/guides/routing#splats). The default is `apps/routes/auth/$.tsx`, but you can configure this route using the `authPathPrefix option`:

```ts
// app/shopify.server.js
import {shopifyApp} from '@shopify/shopify-app-remix';

const shopify = shopifyApp({
  // ...
  authPathPrefix: '/auth',
});
```

Now let's create the [splat route](https://remix.run/docs/en/main/guides/routing#splats) for auth. It should export a loader that uses `shopifyApp` to authenticate:

```ts
// app/routes/auth/$.tsx
import {LoaderArgs} from '@remix-run/node';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderArgs) {
  await shopify.authenticate.admin(request);

  return null;
}
```

Next, set up the `AppProvider` component in your app's routes. To do this pass the `process.env.SHOPIFY_API_KEY` to the frontend via the loader.

Here is an example:

```ts
// root.tsx
import {LoaderArgs} from '@remix-run/node';
import {AppProvider} from '@shopify/shopify-app-remix/react';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderArgs) {
  await shopify.authenticate.admin(request);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY,
  });
}

export default function App() {
  const {apiKey} = useLoaderData<typeof loader>();

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider apiKey={apiKey} isEmbeddedApp>
          <Outlet />
        </AppProvider>
      </body>
    </html>
  );
}
```

This component will set up [Polaris](https://polaris.shopify.com/components/utilities/app-provider) and [App Bridge](https://shopify.dev/tools/app-bridge). If your app isn't embedded, set the `isEmbeddedApp` prop to `false`.

Now that your app is ready to respond to requests, it will also need to add the required `Content-Security-Policy` header directives, as per [our documentation](https://shopify.dev/docs/apps/store/security/iframe-protection).
To do that, this package provides the `shopify.addDocumentResponseHeaders` method.

You should return these headers from any endpoint that renders HTML in your app.
Most likely you'll want to add this to every HTML response by updating the entry.server.tsx file:

```ts
// entry.server.tsx
import shopify from './shopify.server';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  shopify.addDocumentResponseHeaders(request, responseHeaders);

  /// ..etc
}
```

## Setting up for your runtime

By default, this package will work with the runtimes supported by [Remix adapters](https://remix.run/docs/en/1.17.1/other-api/adapter#official-adapters) because it relies on the same [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

Since Node.js doesn't fully implement that API, apps will need to import an extra adapter to set it up before using this package's exports.

In the [Getting Started](#getting-started) section above, you'll notice that the example runs

```ts
import '@shopify/shopify-app-remix/server/adapters/node';
```

before calling `shopifyApp`.
If you're running on a runtime other than Node, then you can simply omit that line.

## Loading your app in admin

To load your app within the Shopify Admin, you need to:

1. Update your app's URL in your Partners Dashboard app setup page to `http://localhost:8080`
1. Update your app's callback URL to `http://localhost:8080/api/auth/callback` in that same page
1. Go to **Test your app** in Partners Dashboard and select your development store

## Authenticating admin requests

`shopifyApp` provides methods for authenticating admin requests.
To authenticate admin requests you can call `shopify.authenticate.admin(request)` in a loader or an action:

```ts
// app/routes/**/*.tsx
export const loader = async ({request}: LoaderArgs) => {
  await shopify.authenticate.admin(request);

  return null;
};
```

If there is a session for this user, this loader will return null.
If there is no session for the user, the loader will throw the appropriate redirect Response.

> **Note**: If you are authenticating more than one route, we recommend using [Remix layout routes](https://remix.run/docs/en/1.18.1/file-conventions/routes-files#layout-routes) to automatically authenticate them.

## Authenticating cross-origin admin requests

If your Remix server is authenticating an admin extension, a request from the extension to Remix is cross-origin. Here `shopify.authenticate.admin` provides a cors function to add the required cross-origin headers:

```ts
export const loader = async ({request}: LoaderArgs) => {
  const {cors} = await shopify.authenticate.admin(request);

  return cors(json({my: 'data'}));
};
```

### Headers

It's important to note that the authentication functions in this package rely on throwing `Response` objects, which must be handled in your Remix routes using them.

To do that, you can set up a [Remix `ErrorBoundary`](https://remix.run/docs/en/main/guides/errors).
We provide some abstractions for the error and headers boundaries to make it easier for apps to set those up.

```ts
// app/routes/**/*.tsx
import {boundary} from '@shopify/shopify-app-remix';

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
```

> **Note**: You can also add this to a layout if you want to authenticate more than one route.

### Using the Shopify admin GraphQL API

To access the [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql) pass a request from a loader or an action to `shopify.authenticate.admin`.
This will either redirect the merchant to install your app or it will give you access to API functions.
E.g:

```ts
// routes/**/*.tsx
import shopify from '../shopify.server';
import {ActionArgs, json} from '@remix-run/node';

export async function action({request}: ActionArgs) {
  const {admin} = await shopify.authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    mutation populateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
        }
      }
    }`,
    {
      variables: {
        input: {
          title: 'New product',
          variants: [{price: 100}],
        },
      },
    },
  );
  const parsedResponse = await response.json();

  return json({data: parsedResponse.data});
}
```

### Using the Shopify admin REST API

`shopify.authenticate.admin` can returns methods for interacting with [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest). To access the [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest) first configure `shopifyApp` with the REST resources you would like to use:

```ts
// app/routes/**/*.tsx
import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

const shopify = shopifyApp({
  restResources,
  // ...etc
});
```

Next pass a request to `shopify.authenticate.admin` in a loader or an action. This will either redirect the merchant to install your app or it will give you access to API functions. E.g:

```ts
// app/routes/**/*.tsx
export const loader = async ({request}: LoaderArgs) => {
  const {admin, session} = await shopify.authenticate.admin(request);
  const data = await admin.rest.resources.Product.count({session});

  return json(data);
};
```

## Authenticating webhook requests

Your app must respond to [mandatory webhook topics](https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks). In addition, your app can register [optional webhook topics](https://shopify.dev/docs/api/admin-rest/2023-04/resources/webhook#event-topics).

To setup webhooks first we need to configure `shopifyApp` with 2 pieces:

1. The webhooks you want to subscribe to. In this example we subscribe to the `APP_UNINSTALLED` topic.
2. The code to register the `APP_UNINSTALLED` topic after a merchant installs you app. Here `shopifyApp` provides an `afterAuth` hook.

```ts
// shopify.server.js
import {shopifyApp, DeliveryMethod} from '@shopify/shopify-app-remix';

const shopify = shopifyApp({
  apiKey: '1707326264fde5037c658n120626ce3f',
  // ...etc
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks',
    },
  },
  hooks: {
    afterAuth: async ({session}) => {
      shopify.registerWebhooks({session});
    },
  },
});
```

Next you must add a route for each `callbackUrl` you pass. It should use the `shopify.authenticate.webhook` function to authenticate the request. For example:

To do this, your app must authenticate the request.

```ts
// routes/webhooks.tsx
import {ActionArgs} from '@remix-run/node';

import shopify from '../shopify.server';
import db from '../db.server';

export const action = async ({request}) => {
  const {topic, shop, session} = await authenticate.webhook(request);

  switch (topic) {
    case 'APP_UNINSTALLED':
      if (session) {
        await db.session.deleteMany({where: {shop}});
      }
      break;
    case 'CUSTOMERS_DATA_REQUEST':
    case 'CUSTOMERS_REDACT':
    case 'SHOP_REDACT':
    default:
      throw new Response('Unhandled webhook topic', {status: 404});
  }

  throw new Response();
};
```

## Authenticating public requests

Your Remix app may need to authenticate requests coming from a public context. An example of this would be a checkout extension. Here is how:

```ts
// e.g: routes/api.public.notes.tsx
import shopify from '../shopify.server';
import {LoaderArgs, json} from '@remix-run/node';
import {getNotes} from '~/models/notes';

export const loader = async ({request}: LoaderArgs) => {
  const {sessionToken, cors} = await shopify.authenticate.public(request);

  // E.g: Get notes using the shops admin domain
  return cors(json(await getNotes(sessionToken.iss)));
};
```

This can be useful if your app exposes checkout or theme extensions and those extensions need to access data from your app.

**Note:** These requests are cross-origin, so you must use the cross-origin helper returned from `shopify.authenticate.public`.

## Session Storage

When calling `shopifyApp`, you must pass in a `sesionStorage` to store sessions.
You can change this by passing a different Session Adaptor to `shopifyApp`.
To make this easy Shopify offers [some production ready session adaptors](https://github.com/Shopify/shopify-app-js/tree/main/packages).

In this example we'll swap the default session adaptor for [Prisma](https://www.prisma.io/).

Let's pass the [Prisma app session storage](https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-session-storage-prisma/README.md) adaptor to `shopifyApp`:

```ts
// app/shopify.server.js
import {shopifyApp} from '@shopify/shopify-app-remix';
import {PrismaSessionStorage} from '@shopify/shopify-app-session-storage-prisma';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const storage = new PrismaSessionStorage(prisma);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

Note that this requires a `schema.prisma` file as defined in the README for [Prisma app session storage](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage-prisma).
Remember to [set up your migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate/get-started) after creating the schema file!

## Gotchas / Troubleshooting

### Navigating to other pages breaks

In Remix apps, you can navigate to a different page either by adding an `<a>` tag, or using the `<Link>` component from `@remix-run/react`.

In Shopify Remix apps you should avoid using `<a>`.
Use `<Link> `from `@remix-run/react` instead.
This ensures that your user remains authenticated.
