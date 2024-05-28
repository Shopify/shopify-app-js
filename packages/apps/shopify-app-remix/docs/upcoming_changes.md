# Upcoming breaking changes

This file contains every breaking change that's currently planned for this package.
You can use it as a guide for migrating your app, and ensuring you're ready for the next big migration.

> **Note**: Every change in this file comes with a deprecated alternative for apps that haven't been updated yet.
> Our goal is to give developers as much time as possible to prepare for changes to reduce the burden of staying up to date.

## Table of contents

- [Upcoming breaking changes](#upcoming-breaking-changes)
  - [Table of contents](#table-of-contents)
  - [Use new authentication strategy for embedded apps](#use-new-authentication-strategy-for-embedded-apps)
  - [Root import path deprecation](#root-import-path-deprecation)
  - [Use the AppProvider component](#use-the-appprovider-component)
  - [Use line item billing configs](#use-line-item-billing-configs)

## Use new authentication strategy for embedded apps

> [!NOTE]
> The `unstable_newEmbeddedAuthStrategy` future flag enabled this behaviour.
> If you've already enabled the flag, you don't need to follow these instructions.

Shopify apps can now use [OAuth token exchange](https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange) to obtain an API access token without having to redirect the user, which makes the process much faster, and less error prone.

This package will automatically use token exchange, but that only works if [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation#shopify-managed-installation) is enabled for the app.
Before updating this package in your app, please ensure you've enabled managed installation.

For more details on how this works, please see the [new embedded authorization strategy](../README.md#new-embedded-authorization-strategy) section in the README.

## Root import path deprecation

Initially, apps could import server-side functions using the following statements:

```ts
import '@shopify/shopify-app-remix/adapters/node';
import {shopifyApp} from '@shopify/shopify-app-remix';
```

With the addition of React component to this package, we've separated the exports between server and react code, as in:

```ts
import '@shopify/shopify-app-remix/server/adapters/node';
import {shopifyApp} from '@shopify/shopify-app-remix/server';
import {AppProvider} from '@shopify/shopify-app-remix/react';
```

## Use the AppProvider component

In order to make it easier to set up the frontend for apps using this package, we introduced a new `AppProvider` component.
Previous apps will continue to work without this component, but we strongly recommend all apps use it because it makes it easier to keep up with updates from Shopify.

To make use of this in the Remix app template, you can update your `app/routes/app.jsx` file's `App` component from

```ts
export default function App() {
  const {apiKey, polarisTranslations} = useLoaderData();

  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        data-api-key={apiKey}
      />
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </ui-nav-menu>
      <PolarisAppProvider
        i18n={polarisTranslations}
        linkComponent={RemixPolarisLink}
      >
        <Outlet />
      </PolarisAppProvider>
    </>
  );
}

/** @type {any} */
const RemixPolarisLink = React.forwardRef((/** @type {any} */ props, ref) => (
  <Link {...props} to={props.url ?? props.to} ref={ref}>
    {props.children}
  </Link>
));
```

to

```ts
import {AppProvider} from '@shopify/shopify-app-remix/react';

export default function App() {
  const {apiKey} = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}
```

## Use line item billing configs

> [!NOTE]
> The `v3_lineItemBilling` future flag enabled this behaviour.
> If you've already enabled the flag, you don't need to follow these instructions.

Before v10 of the `@shopify/shopify-api` package, each recurring payment plan in the app's billing configuration only supported a single item, even though the API itself allows for multiple items per subscription.

To better match the API, the `billing` configuration option was changed to allow for multiple line items per plan, so instead of passing in a single configuration, it now accepts an array of items.

Before:

```ts
const shopify = shopifyApp({
  billing: {
    one_time: {
      interval: BillingInterval.OneTime,
      amount: 10,
      currencyCode: 'USD',
    },
    monthly_plan: {
      interval: BillingInterval.Every30Days,
      amount: 5,
      currencyCode: 'USD',
    },
  },
});
```

After:

```ts
const shopify = shopifyApp({
  billing: {
    one_time: {
      interval: BillingInterval.OneTime,
      amount: 10,
      currencyCode: 'USD',
    },
    monthly_plan: {
      lineItems: [
        {
          interval: BillingInterval.Every30Days,
          amount: 5,
          currencyCode: 'USD',
        },
        {
          interval: BillingInterval.Usage,
          amount: 1,
          currencyCode: 'USD',
          terms: '1 dollar per 1000 emails',
        },
      ],
    },
  },
});
```
