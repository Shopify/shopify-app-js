# `@shopify/shopify-app-remix`

<!-- ![Build Status]() -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![npm version](https://badge.fury.io/js/%40shopify%2Fshopify-app-remix.svg)](https://badge.fury.io/js/%40shopify%2Fshopify-app-remix)

This package makes it easy to use [Remix](https://remix.run/) to build Shopify apps.
It builds on the `@shopify/shopify-api` package and exposes a `shopifyApp` function. You can use `shopifyApp` to configure your app and then authenticate requests from Shopify.

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-remix) for more details on the Remix app package.

## Requirements

To use this package, you will need to have:

- a Shopify Partner account and development store
- an app already set up on your partner account
- a JavaScript package manager such as [yarn](https://yarnpkg.com) installed

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

Next, you'll need to set up some routes and headers so you can embed your app in the Shopify admin.
You can find more details on all the steps described here in the [package documentation](https://shopify.dev/docs/api/shopify-app-remix).

Create `app/shopify.server.js`. We will use this file to configure our Shopify app by calling the [`shopifyApp` function](https://shopify.dev/docs/api/shopify-app-remix/latest/entrypoints/shopifyapp):

```ts
// app/shopify.server.js
// Note that you don't need to import the node adapter if you're running on a different runtime.
import '@shopify/shopify-app-remix/server/adapters/node';
// Memory storage makes it easy to set an app up, but should never be used in production.
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {LATEST_API_VERSION, shopifyApp} from '@shopify/shopify-app-remix';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ['read_products'],
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new MemorySessionStorage(),
});
export default shopify;
```

This will require some environment variables. So let's create an `.env` file:

```env
SHOPIFY_API_KEY="[Copy from partners dashboard]"
SHOPIFY_API_SECRET="[Copy from partners dashboard]"
SHOPIFY_APP_URL="[The tunnel URL you are using to run your app]"
```

`shopifyApp` needs to reserve a [splat route](https://remix.run/docs/en/main/guides/routing#splats) for auth.
It should export a loader that uses `shopifyApp` to authenticate:

```ts
// app/routes/auth/$.tsx
import {LoaderFunctionArgs} from '@remix-run/node';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderFunctionArgs) {
  await shopify.authenticate.admin(request);

  return null;
}
```

Next, set up the [`AppProvider` component](https://shopify.dev/docs/api/shopify-app-remix/latest/entrypoints/appprovider) in your app's routes. To do this pass the `process.env.SHOPIFY_API_KEY` to the frontend via the loader.

Here is an example:

```ts
// root.tsx
import {LoaderFunctionArgs} from '@remix-run/node';
import {AppProvider} from '@shopify/shopify-app-remix/react';

import shopify from '~/shopify.server';

export async function loader({request}: LoaderFunctionArgs) {
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

### Running your app

To run your app and load it within the Shopify Admin, you need to:

1. Update your app's URL in your Partners Dashboard app setup page to `http://localhost:8080`
1. Update your app's callback URL to `http://localhost:8080/api/auth/callback` in that same page
1. Go to **Test your app** in Partners Dashboard and select your development store

## Next steps

Once your app is up and running, you can start using this package to interact with Shopify APIs, webhooks and more.

Here are some guides to help you set up your app:

- [Interacting with Shopify Admin](https://shopify.dev/docs/api/shopify-app-remix/latest/guide-admin)
- [Subscribing to webhooks](https://shopify.dev/docs/api/shopify-app-remix/latest/guide-webhooks)

You can also authenticate requests from surfaces other than the admin.
To see all supported methods, see [the `shopify.authenticate` object documentation](https://shopify.dev/docs/api/shopify-app-remix/latest/authenticate).

### New embedded app authorization strategy

> [!TIP]
> If you are building an embedded app, we **strongly** recommend using [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation)
> with [token exchange](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange) instead of the legacy authorization code grant flow.

We've introduced a new installation and authorization strategy for **embedded apps** that
eliminates the redirects that were previously necessary.
It replaces the existing [installation and authorization code grant flow](https://shopify.dev/docs/apps/auth/get-access-tokens/authorization-code-grant).

This is achieved by using [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation)
to handle automatic app installations and scope updates, while utilizing
[token exchange](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange) to retrieve an access token for
authenticated API access.

##### Enabling this new strategy in your app

> [!NOTE]
> Newly created Remix apps from the template after February 1st 2024 has this feature enabled by default.

1. Enable [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation)
   by configuring your scopes [through the Shopify CLI](https://shopify.dev/docs/apps/tools/cli/configuration).
2. Enable the future flag `unstable_newEmbeddedAuthStrategy` in your app's server configuration file.

```ts
// my-app/app/shopify.server.ts
const shopify = shopifyApp({
  ...
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  }
})

```

3. Enjoy a smoother and faster app installation process.

###### Learn more about:

- [How token exchange works](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange)
- [Using Shopify managed installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation)
- [Configuring access scopes through the Shopify CLI](https://shopify.dev/docs/apps/tools/cli/configuration)

## Gotchas / Troubleshooting

If you're experiencing unexpected behaviors when using this package, check our [app template's documentation](https://github.com/Shopify/shopify-app-template-remix#gotchas--troubleshooting) for the solution to common issues.
