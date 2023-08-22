# Upcoming breaking changes

This file contains every breaking change that's currently planned for this package.
You can use it as a guide for migrating your app, and ensuring you're ready for the next big migration.

> **Note**: Every change in this file comes with a deprecated alternative for apps that haven't been updated yet.
> Our goal is to give developers as much time as possible to prepare for changes to reduce the burden of staying up to date.

## Table of contents

- [Root import path deprecation](#root-import-path-deprecation)
- [Introducing the AppProvider component](#introducing-the-appprovider-component)

## Root import path deprecation

In the current version, apps can import server-side functions using the following statements:

```ts
import '@shopify/shopify-app-remix/adapters/node';
import {shopifyApp} from '@shopify/shopify-app-remix';
```

With the addition of React component to this package, we'll start having full separation between server and react code, as in:

```ts
import '@shopify/shopify-app-remix/server/adapters/node';
import {shopifyApp} from '@shopify/shopify-app-remix/server';
import {AppProvider} from '@shopify/shopify-app-remix/react';
```

## Introducing the AppProvider component

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
