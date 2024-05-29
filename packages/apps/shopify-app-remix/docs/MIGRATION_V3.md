# Migrating to Version 3.0.0

## Replace `authenticate.public()` with `authenticate.public.checkout()`

The `v3_authenticatePublic` future flag has been enabled, and removed.

The `authenticate.public` export used to be a function that was meant to authenticate [checkout extension](https://shopify.dev/docs/api/checkout-extensions) requests.

That was confusing, because:

- It isn't the only type of public requests apps might need to handle
- It didn't make it clear what the purpose of the export was

We refactored the export so that all public authentication methods are grouped together under `authenticate.public`, for instance `authenticate.public.checkout()` and `authenticate.public.appProxy()`.

Before:

```ts
export async function loader({request}: LoaderFunctionArgs) {
  await authenticate.public(request);

  return null;
}
```

After:

```ts
export async function loader({request}: LoaderFunctionArgs) {
  await authenticate.public.checkout(request);

  return null;
}
```

## Root import path deprecation

Apps can no longer import server-side functions using the following statements:

```diff
import '@shopify/shopify-app-remix/adapters/node';
+ import {shopifyApp} from '@shopify/shopify-app-remix';
```

With the addition of React component to this package, we've separated the exports between server and react code, as in:

```diff
import '@shopify/shopify-app-remix/server/adapters/node';
+ import {shopifyApp} from '@shopify/shopify-app-remix/server';
- import {shopifyApp} from '@shopify/shopify-app-remix';
import {AppProvider} from '@shopify/shopify-app-remix/react';
```

## Use the AppProvider component

> [!NOTE]
> Most apps should already be using the `AppProvider` component, by default.

In order to make it easier to set up the frontend for apps using this package, we introduced a new `AppProvider` component.
We strongly recommend all apps use it because it makes it easier to keep up with updates from Shopify.

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
