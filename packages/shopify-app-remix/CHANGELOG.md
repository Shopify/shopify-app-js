# @shopify/shopify-app-remix

## 2.8.0

### Minor Changes

- cb656dc: Added `AppProxy` React components to enable JS behind proxies

### Patch Changes

- 4aa4b59: Bump shopify-api to v9.6.0
- Updated dependencies [4aa4b59]
  - @shopify/shopify-app-session-storage@2.1.3

## 2.7.0

### Minor Changes

- 6e45991: Adds an API to authenticate fulfillment service notifications

  Learn more about [fulfillment service apps](https://shopify.dev/docs/apps/fulfillment/fulfillment-service-apps/manage-fulfillments).

  ```
  //app/routes/fulfillment_order_notification.jsx

  import { authenticate } from "../shopify.server";

  export const action = async ({ request }) => {
      const { admin, payload } = await authenticate.fulfillmentService(request);

      if (!admin) {
        throw new Response();
      }
      console.log(payload.kind, 'kind'); //FULFILLMENT_REQUEST
      throw new Response();
    };
  ```

### Patch Changes

- 674f6e3: Show an INFO log for disabled future flags to encourage apps to migrate ahead of time, making major version bumps simpler.
- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1
- 5aecf7d: Make `authenticate.webhook` return type's `payload` field more flexible, so apps aren't required to cast every value.
- Updated dependencies [3938adc]
- Updated dependencies [c6c975f]
  - @shopify/shopify-app-session-storage@2.1.2

## 2.6.1

### Patch Changes

- c95cfdf: Update AppConfig type to Readonly. The config should not be modified after it is created.
- 6deb1bd: Updated dependency on `semver`

## 2.6.0

### Minor Changes

- 1002934: Add new v3_lineItemBilling future flag

  With this future flag you can configure billing plans to have multiple line items, eg. a recurring plan and a usage based plan.

  ```ts
  //shopify.server.ts
  import { shopifyApp, BillingInterval } from "@shopify/shopify-app-remix/server";

  export const MONTHLY_PLAN = 'Monthly subscription';
  export const ANNUAL_PLAN = 'Annual subscription';

  const shopify = shopifyApp({
    // ...etc
    billing: {
      [MONTHLY_PLAN]: {
        lineItems: [
         {
           amount: 5,
           currencyCode: 'USD',
           interval: BillingInterval.Every30Days,
          }
          {
              amount: 1,
              currencyCode: 'USD',
              interval: BillingInterval.Usage
              terms: "1 dollar per 1000 emails",
          }
        ],
      },
    },
    future: {v3_lineItemBilling: true}
  });
  export default shopify;
  export const authenticate = shopify.authenticate;

  ```

- 956f493: Allow subscribing to webhooks with sub-topics
- 6df84d2: Introduce Vercel adapter to fix deploys to Vercel.

  Since v.9.0.0 of `@shopify/shopify-api` developers deploying their Remix apps to Vercel have encountered errors.

  Developers looking to deploy their application to Vercel should replace references to import `"@shopify/shopify-app-remix/adapters/node";` with `"@shopify/shopify-app-remix/adapters/vercel";` to properly load the required global variables.

### Patch Changes

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2
- 7787a1a: Fix billing redirect issue when using the new embedded auth strategy
- Updated dependencies [02a8341]
- Updated dependencies [321d6a4]
  - @shopify/shopify-app-session-storage@2.1.1

## 2.5.1

### Patch Changes

- 22b7744: Throw error when attempting to exit-iframe with an invalid URL

## 2.5.0

### Minor Changes

- 6d5b4e0: Add check function to the billing API
- ba3eff7: Added a new method `shopify.authenticate.flow(request)`, which will validate a Flow extension request, and return the payload / API clients to the app.
- da09f4e: Add SessionNotFoundError for unauthenticated requests
- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- 8811faa: Updated the `@shopify/admin-api-client` dependency
- f5742c1: Updated dependency on `@shopify/shopify-api`
- d0a5483: Remove references to unstable_tokenExchange
- 37dff44: Updated Remix dependencies to v2.5.1
- Updated dependencies [f5742c1]
- Updated dependencies [64e0246]
  - @shopify/shopify-app-session-storage@2.1.0

## 2.4.0

### Minor Changes

- 2473c85: Add new embedded authorization strategy relying on Shopify managed install and OAuth token exchange

  :exclamation: For more information on how to enable this feature, see ["New Embedded Authorization Strategy"](./README.md#new-embedded-authorization-strategy)

### Patch Changes

- 35b74dd: Fixes a bug that was causing external redirects to fail in remix actions
- 42013e8: Minor refactor in login.ts to use new URL util method from shopify-api-js
- b4eeb24: Improved and simplified package.json dependencies
- b998c30: Bump shopify-api version from 9.0.1 to 9.0.2
- b998c30: Handle webhook registration throttling error
- f445164: Use 'body' field from GraphqlQueryError when logging session validation error
- Updated dependencies [b4eeb24]
- Updated dependencies [b998c30]
  - @shopify/shopify-app-session-storage@2.0.4

## 2.3.0

### Minor Changes

- a9c7836: Adding support for the new clients from `@shopify/admin-api-client` and `@shopify/storefront-api-client` that can leverage `@shopify/api-codegen-preset` to automatically type GraphQL operations using Codegen.

  For more information on how to add types to your queries, see [the `@shopify/api-codegen-preset` documentation](https://github.com/Shopify/shopify-api-js/tree/main/packages/api-codegen-preset).

### Patch Changes

- Updated dependencies [d3e4b5e]
  - @shopify/shopify-app-session-storage@2.0.3

## 2.2.0

### Minor Changes

- d92f828: Refactor AuthStrategy to extract OAuth authorization code flow behaviour into a separate class.

### Patch Changes

- 8c36e82: Fixing a bug in the GraphQL client that could cause specific builds to fail, because we used `query` for both the function and argument names.
- 9d0fc6f: Now `authenticate.webhook(request);` will return 401 Unauthorized when webhook HMAC validation fails.
- 3685bd4: Bump shopify-api to ^8.1.1
- Updated dependencies [3685bd4]
  - @shopify/shopify-app-session-storage@2.0.2

## 2.1.0

### Minor Changes

- f34eefd: Added v3_authenticatePublic feature flag to remove `authenticate.public(request)`.

  Apps can opt in to the new future at any time, so this is not a breaking change until version 3.

    <details>
      <summary>See an example</summary>

  Without the `v3_authenticatePublic` future flag the deprecated `authenticate.public(request)` is supported:

  ```ts
  await authenticate.public.checkout(request);
  await authenticate.public.appProxy(request);

  // Deprecated.  Use authenticate.public.checkout(request) instead
  await authenticate.public(request);
  ```

  With the `v3_authenticatePublic` future flag enabled the deprecated `authenticate.public(request)` is not supported:

  ```ts
  await authenticate.public.checkout(request);
  await authenticate.public.appProxy(request);
  ```

    </details>

## 2.0.2

### Patch Changes

- ee7114a: Fixed the errorBoundary to work with new cases in Remix v2. Thank you @btomaj!

## 2.0.1

### Patch Changes

- 6d12840: Updating dependencies on @shopify/shopify-api
- Updated dependencies [6d12840]
  - @shopify/shopify-app-session-storage@2.0.1

## 2.0.0

### Major Changes

- f837060: **Removed support for Node 14**

  Node 14 has reached its [EOL](https://endoflife.date/nodejs), and dependencies to this package no longer work on Node 14.
  Because of that, we can no longer support that version.

  If your app is running on Node 14, you'll need to update to a more recent version before upgrading this package.

  This upgrade does not require any code changes.

### Minor Changes

- a1b3393: Added support for `future` flags in the `shopifyApp` function, with a `v3_webhookContext` flag to have `authenticate.webhook` return a standard `admin` context, instead of a different type.

  Apps can opt in to the new future at any time, so this is not a breaking change (yet).

  <details>
    <summary>See an example</summary>

  Without the `v3_webhookContext` flag, `graphql` provides a `query` function that takes the query string as the `data` param.
  When using variables, `data` needs to be an object containing `query` and `variables`.

  ```ts
  import { json, ActionFunctionArgs } from "@remix-run/node";
  import { authenticate } from "../shopify.server";

  export async function action({ request }: ActionFunctionArgs) {
    const { admin } = await authenticate.webhook(request);

    const response = await admin?.graphql.query<any>({
      data: {
        query: `#graphql
        mutation populateProduct($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
            }
          }
        }`,
        variables: { input: { title: "Product Name" } },
      },
    });

    const productData = response?.body.data;
    return json({ data: productData.data });
  }
  ```

  With the `v3_webhookContext` flag enabled, `graphql` _is_ a function that takes in the query string and an optional settings object, including `variables`.

  ```ts
  import { ActionFunctionArgs } from "@remix-run/node";
  import { authenticate } from "../shopify.server";

  export async function action({ request }: ActionFunctionArgs) {
    const { admin } = await authenticate.webhook(request);

    const response = await admin?.graphql(
      `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
        }
      }`,
      { variables: { input: { title: "Product Name" } } },
    );

    const productData = await response.json();
    return json({ data: productData.data });
  }
  ```

  </details>

### Patch Changes

- afb0a7d: Updating Remix dependencies to v2.
- a69d6fc: Updating dependency on @shopify/shopify-api to v.8.0.1
- Updated dependencies [f837060]
- Updated dependencies [a69d6fc]
  - @shopify/shopify-app-session-storage@2.0.0

## 1.3.0

### Minor Changes

- 6ac6832: Added the storefront GraphQL client.

  The storefront API client can be accessed in two ways

  <details>
    <summary>App Proxy</summary>

  ```ts
  import { json } from "@remix-run/node";
  import { authenticate } from "~/shopify.server";

  export async function loader({ request }) {
    const { storefront } = await authenticate.public.appProxy(request);
    const response = await storefront.graphql("{blogs(first: 10) {nodes{id}}}");

    return json(await response.json());
  }
  ```

  </details>

  <details>
    <summary>Unauthenticated Storefront</summary>

  ```ts
  import { json } from "@remix-run/node";
  import { unauthenticated } from "~/shopify.server";
  import { customAuthenticateRequest } from "~/helpers";

  export async function loader({ request }) {
    await customAuthenticateRequest(request);

    const { storefront } = await unauthenticated.storefront(
      "my-shop.myshopify.com",
    );
    const response = await storefront.graphql("{blogs(first: 10) {nodes{id}}}");

    return json(await response.json());
  }
  ```

  </details>

### Patch Changes

- 64fe70b: Allow all billing config overrides at request time.

  <details>
    <summary>Override billing configs when calling <code>request</code></summary>

  ```ts
  import { json } from "@remix-run/node";
  import { authenticate } from "~/shopify.server";

  export async function loader({ request }) {
    const { billing } = await authenticate.admin(request);

    await billing.require({
      plans: ["plan1", "plan2"],
      onFailure: async () =>
        await billing.request({
          plan: "plan1",
          trialDays: 5, // Override the trialDays config value
        }),
    });

    return json(await response.json());
  }
  ```

  </details>

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0
- Updated dependencies [616388d]
  - @shopify/shopify-app-session-storage@1.1.10

## 1.2.1

### Patch Changes

- bffcee9: Fix type error. Previously `authenticate.appProxy()` was typed as if it could return an object without session and admin properties. This was incorrect. Those properties will always exist, they may just be undefined.

## 1.2.0

### Minor Changes

- 43e7058: Added `authenticate.public.appProxy()` for authenticating [App Proxy](https://shopify.dev/docs/apps/online-store/app-proxies) requests.

  <details>
    <summary>Returning a liquid response</summary>

  ```ts
  // app/routes/**\/.ts
  import { authenticate } from "~/shopify.server";

  export async function loader({ request }) {
    const { liquid, admin } = authenticate.public.appProxy(request);

    return liquid("Hello {{shop.name}}");
  }
  ```

  </details>

  <details>
    <summary>Using the Admin GraphQL API</summary>

  ```ts
  // app/routes/**\/.ts
  import { authenticate } from "~/shopify.server";

  export async function loader({ request }) {
    const { liquid, admin } = authenticate.public.appProxy(request);

    const response = await admin.graphql("QUERY");
    const json = await response.json();

    return json(json);
  }
  ```

  </details>

- 43e7058: Copied `authenticate.public()` to `authenticate.public.checkout()` and marked `authenticate.public()` as deprecated. `authenticate.public()` will continue to work until v3

### Patch Changes

- 0acfd52: Remove trailing slashes from shop domains when handling login form requests.
- 19696a0: Fixed an issue when running the app behind a reverse proxy that rewrites the `Host` header, where the bounce flow redirect (to ensure the id_token search param is present) relied on the incoming request URL and pointed to the internal host rather than the external one.
- Updated dependencies [5b862fe]
  - @shopify/shopify-app-session-storage@1.1.9

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
  import { shopifyApp } from "@shopify/shopify-app-remix";
  import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";

  const shopify = shopifyApp({
    restResources,
    // ...etc
  });

  export default shopify;

  // app/routes/\/.jsx
  import { json } from "@remix-run/node";
  import { authenticateExternalRequest } from "~/helpers/authenticate";
  import shopify from "../../shopify.server";

  export async function loader({ request }) {
    const shop = await authenticateExternalRequest(request);
    const { admin, session } = await shopify.unauthenticated.admin(shop);

    return json(await admin.rest.resources.Product.count({ session }));
  }
  ```

  </details>

- 191241b: Adding a new `redirect` helper to the `EmbeddedAdminContext` type, which will be able to redirect to the given URL regardless of where an embedded app request is being served.

  You can also use it to redirect to an external page out of the Shopify Admin by using the `target` option.

  <details>
    <summary>See an example</summary>

  ```ts
  export const loader = async ({ request }) => {
    const { redirect } = await authenticate.admin(request);

    return redirect("https://www.example.com", { target: "_top" });
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
