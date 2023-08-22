# @shopify/shopify-app-remix

## 1.1.0

### Minor Changes

- 370fc5e: - Internally rearranged source files to create a better separation between backend and frontend code, so we can add frontend-specific exports.

  - A new export path `@shopify/shopify-app-remix/react` will now contain those frontend exports.
  - The existing server code will be moved to `@shopify/shopify-app-remix/server`, but the root import will still work until the next major release in the future.

- 7bc32b1: Added a way to get an admin context without authenticating.

  **Warning** This should only be used for Requests that do not originate from Shopify.
  You must do your own authentication before using this method.

  <details>
    <summary>See an example</summary>

  ```ts
  // app/shopify.server.ts
  import {shopifyApp} from '@shopify/shopify-app-remix';
  import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

  const shopify = shopifyApp({
    restResources,
    // ...etc
  });

  export default shopify;

  // app/routes/\/.jsx
  import {json} from '@remix-run/node';
  import {authenticateExternalRequest} from '~/helpers/authenticate';
  import shopify from '../../shopify.server';

  export async function loader({request}) {
    const shop = await authenticateExternalRequest(request);
    const {admin, session} = await shopify.unauthenticated.admin(shop);

    return json(await admin.rest.resources.Product.count({session}));
  }
  ```

  </details>

- 191241b: Adding a new `redirect` helper to the `EmbeddedAdminContext` type, which will be able to redirect to the given URL regardless of where an embedded app request is being served.

  You can also use it to redirect to an external page out of the Shopify Admin by using the `target` option.

  <details>
    <summary>See an example</summary>

  ```ts
  export const loader = async ({request}) => {
    const {redirect} = await authenticate.admin(request);

    return redirect('https://www.example.com', {target: '_top'});
  };
  ```

  </details>

- f5f1f83: Adding `AppProvider` component to abstract Shopify-specific app setup on the frontend side.
  This makes it easier for apps to set up the components it needs to work with Shopify.

  <details>
    <summary>See an example</summary>

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

  </details>

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- 14e8019: Enable `authenticate.public` to handle post-purchase extension requests by supporting extra CORS headers and fixing session token verification.
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 1.0.4

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- ebce92f: Re-export ApiVersion object from shopify-api
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 1.0.3

### Patch Changes

- e9cefea: Fixing issue when authenticating requests without a `shop` search param to non-embedded apps.

## 1.0.2

### Patch Changes

- 2d087a4: authenticate.webhook now returns context when there is no session for the corresponding shop instead of throwing a 404 Response

## 1.0.1

### Patch Changes

- 92205c2: Fixing small issue in the README

## 1.0.0

Initial release of the @shopify/shopify-app-remix package 🎉
