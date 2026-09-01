# @shopify/shopify-app-react-router

## 3.0.0

### Major Changes

- d641a62: Remove `eventId` and `resourceId` from events webhooks

  Shopify is dropping the `shopify-event-id` and `shopify-resource-id` headers from events deliveries, so the libraries no longer read them. Both fields are gone from the public types, which makes this a breaking change.

  Webhooks are unaffected. They keep the `X-Shopify-Event-Id` header and the `eventId` field.

  ## Migration Guide

  Stop reading `eventId` and `resourceId` on events deliveries. Neither field has a direct equivalent: `eventId` identified the event behind a delivery, and `resourceId` carried the root resource's GID, which you can read from the payload instead.

  To deduplicate events deliveries, use `webhookId`. It comes from the `shopify-webhook-id` header, which Shopify still sends, and it is unique per delivery.

  ### For @shopify/shopify-app-remix and @shopify/shopify-app-react-router

  **Before:**

  ```typescript
  export const action = async ({request}: ActionFunctionArgs) => {
    const {webhookType, eventId, resourceId} =
      await authenticate.webhook(request);

    if (webhookType === 'events') {
      console.log(`Event ${eventId} for resource ${resourceId}`);
    }

    return new Response();
  };
  ```

  **After:**

  ```typescript
  export const action = async ({request}: ActionFunctionArgs) => {
    const {webhookType, payload} = await authenticate.webhook(request);

    if (webhookType === 'events') {
      // eventId and resourceId are no longer set on events deliveries.
      // The root resource's GID is in the payload.
      console.log(payload);
    }

    return new Response();
  };
  ```

### Patch Changes

- Updated dependencies [d641a62]
  - @shopify/shopify-api@15.0.0
  - @shopify/shopify-app-session-storage@7.0.0

## 2.1.0

### Minor Changes

- 5342ba6: Added the ability to specify the polaris.js version you want to use. This is useful for trying out Polaris release candidate builds before they are released to the public.

  Set the URL in both places so the rendered `<script>` tag and the preload `Link` header stay in sync.

  Pass `polarisUrl` to the `AppProvider` component to control the script tag:

  ```diff
    <AppProvider
      apiKey={apiKey}
  +   polarisUrl="https://cdn.shopify.com/shopifycloud/polaris-1.rc.js"
    >
      <Outlet />
    </AppProvider>
  ```

  Pass `polarisUrl` to `shopifyApp` to control the preload `Link` header:

  ```diff
    const shopify = shopifyApp({
      // ...
  +   polarisUrl: "https://cdn.shopify.com/shopifycloud/polaris-1.rc.js",
    });
  ```

  Both default to the current stable Polaris URL, so apps that don't set `polarisUrl` are unaffected.

## 2.0.1

### Patch Changes

- 53fdafb: Clarify billing reference docs: label the `billing` object as Manual Pricing, and note that Shopify App Pricing supports usage-based plans through the App Events API instead of usage records.
- 8689457: Redact OAuth credentials from HTTP debug logs. When debug-level logging is enabled, OAuth token request bodies are no longer written to the log, and credential headers (`Authorization`, `Cookie`, `Set-Cookie`, `X-Shopify-Access-Token`, `Shopify-Storefront-Private-Token`, `X-Shopify-Storefront-Access-Token`) are replaced with `****`. This comes from `@shopify/shopify-api` and applies to every API client this package creates.
- Updated dependencies [8689457]
  - @shopify/shopify-api@14.0.1
  - @shopify/shopify-app-session-storage@6.0.1

## 2.0.0

### Major Changes

- 9fec7af: Require Node.js 22 or later. Node.js 20 is no longer supported. Upgrade your runtime to Node.js 22 or newer before updating.
- 493094d: Tighten the public GraphQL client types for better type safety and editor hints.

  - `ResponseErrors.graphQLErrors` is now typed as `GraphQLError[]` (with `message`, `locations`, `path`, and error `extensions`) instead of `any[]`. A new `GraphQLError` type is exported.
  - `GQLExtensions` now documents the Admin `cost`/`throttleStatus` and Storefront `context` shapes, while keeping a permissive index signature so any other extension key still works.
  - `RequestOptions` fields are now `readonly`.

  These types are re-exported or surfaced by `@shopify/admin-api-client`, `@shopify/storefront-api-client`, `@shopify/shopify-api`, `@shopify/shopify-app-remix`, `@shopify/shopify-app-react-router`, and `@shopify/shopify-app-express`, so the change flows through to those packages too.

  This is marked as a major out of caution, but it is very unlikely to affect an app in a meaningful way: the extension types keep a permissive index signature, so existing property access keeps working, and most callers only gain better autocomplete. The main things a strict compiler could flag are reassigning `readonly` `RequestOptions` fields, or reading non-standard properties off a `graphQLErrors` entry.

- 0dbb90c: Remove the public non-embedded React Router app configuration surface.

  `AppProvider` now always renders App Bridge, requires an `apiKey`, and no longer accepts an `embedded` prop. `shopifyApp` now rejects `isEmbeddedApp` configuration.

  To update an app:

  - Replace embedded Admin route usage of `AppProvider`:

    ```diff
    - <AppProvider embedded apiKey={apiKey}>
    + <AppProvider apiKey={apiKey}>
        <Outlet />
      </AppProvider>
    ```

  - Remove Polaris-only or login-page usage of `AppProvider`:

    ```diff
    - <AppProvider embedded={false}>
    -   <s-page>...</s-page>
    - </AppProvider>
    + <s-page>...</s-page>
    ```

  - Remove `isEmbeddedApp` from `shopifyApp` configuration:

    ```diff
      const shopify = shopifyApp({
        // ...
    -   isEmbeddedApp: false,
      });
    ```

  For apps based on the React Router template, the dedicated `/auth/login` UI route can be removed. Move the `shopify.login(request)` call into the root route action and have the root login form post to itself instead of `/auth/login`:

  ```diff
  - <Form method="post" action="/auth/login">
  + <Form method="post">
  ```

  Then handle the form submission in the root route:

  ```ts
  export const action = async ({request}: ActionFunctionArgs) => {
    const errors = loginErrorMessage(await login(request));

    return {errors};
  };
  ```

  This keeps manual shop-domain login available without keeping a separate non-embedded-looking route that wraps content in `<AppProvider embedded={false}>`.

- 84397d9: Removed deprecated `subTopic` from webhooks. The subTopic feature was deprecated in API version 2024-04 and fully removed in 2024-07.

  ## Migration Guide

  The `subTopic` feature was deprecated in API version 2024-04 and fully removed in 2024-07. Use [webhook filters](https://shopify.dev/docs/apps/build/webhooks/customize/filters) instead.

  ### For @shopify/shopify-api

  **Webhook Handlers** - Remove the `subTopic` parameter:

  **Before:**

  ```typescript
  async function handler(
    topic: string,
    shop: string,
    body: string,
    webhookId: string,
    apiVersion: string,
    subTopic: string,
  ) {
    console.log(`SubTopic: ${subTopic}`);
    // handler logic
  }
  ```

  **After:**

  ```typescript
  async function handler(
    topic: string,
    shop: string,
    body: string,
    webhookId: string,
    apiVersion: string,
  ) {
    // subTopic is no longer available
    // Use filters when registering webhooks instead
    // handler logic
  }
  ```

  **Webhook Registration** - Replace `subTopic` with `filter`:

  **Before:**

  ```typescript
  shopify.webhooks.addHandlers({
    METAOBJECTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks',
      subTopic: 'type:my-metaobject-type',
    },
  });
  ```

  **After:**

  ```typescript
  // For metaobjects webhooks, filters are now REQUIRED
  shopify.webhooks.addHandlers({
    METAOBJECTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks',
    },
  });

  // Apply filters via the GraphQL Admin API or app configuration:
  // filter: "type:my-metaobject-type"
  // Multiple types: "type:banana OR type:apple"
  ```

  ### For @shopify/shopify-app-remix and @shopify/shopify-app-react-router

  Remove `subTopic` from webhook context:

  **Before:**

  ```typescript
  export const action = async ({request}: ActionFunctionArgs) => {
    const {topic, subTopic, payload} = await authenticate.webhook(request);
    console.log(`SubTopic: ${subTopic}`);
    return new Response();
  };
  ```

  **After:**

  ```typescript
  export const action = async ({request}: ActionFunctionArgs) => {
    const {topic, payload} = await authenticate.webhook(request);
    // Use the payload data to determine specifics
    // For metaobjects: payload.type contains the metaobject type
    return new Response();
  };
  ```

  ### Important Notes
  - **Metaobjects webhooks** (`metaobjects/create`, `metaobjects/update`, `metaobjects/delete`) now **require filters**
  - Use `filter: "type:{type}"` format where `{type}` is the metaobject definition's type
  - Wildcard filters like `type:*` are not supported - explicitly specify each type
  - For app-owned metaobject definitions, use the full type value: `app--{your-app-id}--{some-namespace}`

  Learn more: [Webhook filters documentation](https://shopify.dev/docs/apps/build/webhooks/customize/filters)

### Patch Changes

- c7ab037: Updated `isbot`, ` mongodb`, ` mysql2`, ` pg`, ` pg-connection-string` dependencies
- f4aa24e: Fix 'Authenticating admin request' info log always showing null for shop. The shop is now logged after it is extracted from the session token context, so it reflects the actual shop value instead of null.
- 264d5c6: Fixed an issue where embedded apps would incorrectly show the login page when
  `shop` or `host` query params were missing from a document request (e.g. after
  SPA navigation followed by a full page reload during local development).

  Instead of redirecting to the login path, the server now renders a minimal App
  Bridge page. App Bridge detects it is still embedded in the Shopify admin iframe,
  retrieves the session token from the parent frame, and re-authenticates
  seamlessly — no user interaction required.

  This is a non-breaking change. The previous login redirect was effectively dead
  code for embedded apps (`isEmbeddedApp` is always `true` for apps using this
  library; the `ShopifyAdmin` distribution is excluded earlier in the pipeline).
  No public APIs are added, removed, or changed.

- 857c598: Harden app proxy authentication by rejecting repeated security parameters while preserving repeated application query parameters. App proxy HMAC validation now consumes structured URL search parameters in the shared API package.
- fe6bb0e: Consolidates the polaris url into a single, shared variable
- Updated dependencies [9fec7af]
- Updated dependencies [c439dab]
- Updated dependencies [c7ab037]
- Updated dependencies [6675463]
- Updated dependencies [493094d]
- Updated dependencies [b1bcc27]
- Updated dependencies [84397d9]
- Updated dependencies [45f1a4b]
- Updated dependencies [857c598]
  - @shopify/shopify-api@14.0.0
  - @shopify/admin-api-client@2.0.0
  - @shopify/storefront-api-client@2.0.0
  - @shopify/shopify-app-session-storage@6.0.0

## 1.2.1

### Patch Changes

- a71dc5c: Add @publicDocs JSDoc tags to top-level types and upgrade @shopify/generate-docs to v1.1.0 to enable v2 documentation pipeline.
- e510582: Updated `@graphql-codegen/introspection`, ` @graphql-codegen/typescript`, ` isbot` dependencies
- 832fad0: Updated `isbot` dependencies
- 430e633: Updated `react-router` dependencies
- e4db082: Add `webhookId` (`shopify-webhook-id`) as a required field on Events webhooks. This is the true idempotency key for webhook deliveries. Previously, only `eventId` was extracted for Events webhooks and was used as a fallback for `webhookId` in downstream packages. This is no longer true. Both fields now coexist and represent distinct values.
- 0bdc123: `AppProxyLink` now uses `forwardRef`, allowing consumers to attach a ref to the
  underlying `<a>` element (e.g. `anchor.current.focus()`).
- 1a6c3bf: Fixed an issue where `authenticate.admin(request).redirect(...)` could propagate embedded request parameters (including the session token) to a cross-origin destination when given a protocol-relative or backslash-prefixed URL. The same-origin check now uses the resolved URL's origin rather than a lexical prefix match, so only genuine same-origin redirects inherit request parameters.
- 4aef9dc: Fixed an issue where embedded apps would incorrectly show the login page when
  `shop` or `host` query params were missing from a document request (e.g. after
  SPA navigation followed by a full page reload during local development).

  Instead of redirecting to the login path, the server now renders a minimal App
  Bridge page. App Bridge detects it is still embedded in the Shopify admin iframe,
  retrieves the session token from the parent frame, and re-authenticates
  seamlessly — no user interaction required.

  This is a non-breaking change. The previous login redirect was effectively dead
  code for embedded apps (`isEmbeddedApp` is always `true` for apps using this
  library; the `ShopifyAdmin` distribution is excluded earlier in the pipeline).
  No public APIs are added, removed, or changed.

  Additionally hardened `renderAppBridge` to sanitize the `shop` query param
  before using it in response headers, so an invalid/attacker-controlled value
  cannot be reflected into the `Content-Security-Policy: frame-ancestors` or
  `Link` preconnect headers.

- Updated dependencies [9264a64]
- Updated dependencies [e510582]
- Updated dependencies [832fad0]
- Updated dependencies [6c95ae1]
- Updated dependencies [e4db082]
- Updated dependencies [7ec655a]
  - @shopify/shopify-api@13.1.0
  - @shopify/shopify-app-session-storage@5.0.1

## 1.2.0

### Minor Changes

- 78c8968: **BREAKING CHANGE**: Removed `customShopDomains` configuration parameter. Use `domainTransformations` instead, which provides both validation and transformation capabilities.

  The `SHOP_CUSTOM_DOMAIN` environment variable is no longer supported.

  **Migration Guide**:

  If you were using `customShopDomains` for validation only:

  ```typescript
  // Before
  shopifyApi({
    customShopDomains: ['custom\.domain\.com'],
  });

  // After
  shopifyApi({
    domainTransformations: [
      {
        match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.custom\.domain\.com$/,
        transform: '$1.custom.domain.com',
      },
    ],
  });
  ```

- 1eb863d: Add support for verifying webhooks delivered with the new `shopify-*` headers (replacing the previous `x-shopify-*` headers), and refactor webhook validation types to a discriminated union on `webhookType`.

  **Breaking change in `@shopify/shopify-api`:** `WebhookFields` is now a discriminated union (`WebhooksWebhookFields | EventsWebhookFields`) keyed on the required `webhookType` field. `webhookId` only exists on `WebhooksWebhookFields`; `eventId` is required on `EventsWebhookFields`. Consumers must narrow on `webhookType` to access type-specific fields. Both `WebhooksWebhookFields` and `EventsWebhookFields` are exported for use in type narrowing.

  Before:

  ```typescript
  const check = await shopify.webhooks.validate({rawBody, rawRequest: request});
  if (check.valid) {
    console.log(check.webhookId);
  }
  ```

  After:

  ```typescript
  const check = await shopify.webhooks.validate({rawBody, rawRequest: request});
  if (check.valid) {
    if (check.webhookType === 'webhooks') {
      console.log(check.webhookId); // only on webhooks
      console.log(check.subTopic); // only on webhooks
    } else {
      console.log(check.eventId); // only on events
      console.log(check.handle); // only on events
      console.log(check.action); // only on events
      console.log(check.resourceId); // only on events
    }
  }
  ```

  **`@shopify/shopify-app-react-router` and `@shopify/shopify-app-remix`:** The webhook context now includes new fields based on the new webhook headers, such as `webhookType`, `handle`, `action`, `resourceId`, `triggeredAt`, and `eventId`. For events webhooks, `webhookId` is set to the value of the `eventId` header for backwards compatibility — prefer using `eventId` directly for events webhooks, as `webhookId` will be removed from events webhooks in the next major version.

  ```typescript
  export const action = async ({request}: ActionFunctionArgs) => {
    const {webhookType, handle, action, resourceId, triggeredAt, eventId} =
      await authenticate.webhook(request);
    return new Response();
  };
  ```

### Patch Changes

- 4c1789b: Updated `@graphql-codegen/typescript`, ` @parcel/watcher`, ` isbot` dependencies
- d5ae946: Publish TypeScript source files to npm so "Go to Definition" in IDEs navigates to real source code instead of compiled `.d.ts` declaration files. Source maps already pointed to the correct paths — the source files just weren't included in the published packages.
- Updated dependencies [0d4a3f7]
- Updated dependencies [4c1789b]
- Updated dependencies [78c8968]
- Updated dependencies [d5ae946]
- Updated dependencies [0bb7837]
- Updated dependencies [1eb863d]
  - @shopify/shopify-api@13.0.0
  - @shopify/admin-api-client@1.1.2
  - @shopify/storefront-api-client@1.0.10
  - @shopify/shopify-app-session-storage@5.0.0

## 1.1.1

### Patch Changes

- 60dc5ce: Updated `isbot` dependencies
- Updated dependencies [60dc5ce]
- Updated dependencies [0fa5ef7]
  - @shopify/shopify-api@12.3.0
  - @shopify/shopify-app-session-storage@4.0.5

## 1.1.0

### Minor Changes

- 9957d69: We are introducing support for expiring offline access tokens. This feature improves security by limiting the lifespan of offline access tokens and automatically refreshing them using refresh tokens.
  - **New Future Flag**: Added `expiringOfflineAccessTokens` (boolean) to the `future` configuration in `shopifyApp`. When enabled, the library will start using expiring offline tokens and automatically check if it is expired or nearing expiration. If expired/expiring, it attempts to refresh the access token using the stored refresh token. Defaults to `false` for backward compatibility.
  - **Automatic Token Refresh**: Integrated token refresh logic into authentication flows (`flow`, `fulfillmentService`, `appProxy`, `webhooks`) and unauthenticated contexts (`admin`, `storefront`). When a session is loaded and found to be expired (or expiring within 5 minutes), and the feature is enabled, the library transparently refreshes the token and persists the new session data. This behavior applies to both offline and online tokens.

  To enable expiring offline access tokens in your app, you must ensure your session storage can persist refresh tokens. For now, this will only work if you are using the Prisma Session Storage package. We're starting with Prisma since this is what the majority of our developers use. If you're using a different session storage adapter and would like support for expiring offline tokens, we'd love to hear from you! If you are using Prisma, follow these steps:
  1. Update your `@shopify/shopify-api` and `@shopify/shopify-app-session-storage-prisma` packages to the latest version.
  2. Update your Prisma schema to include the `refreshToken` and `refreshTokenExpires` fields in the `Session` model:

  ```prisma
  model Session {
    // ...
    refreshToken        String?
    refreshTokenExpires DateTime?
  }
  ```

  3. Run a migration to update your database:

  ```sh
  npx prisma migrate dev
  ```

  4. Update the generated types to include the new fields:

  ```sh
  npx prisma generate
  ```

  5. Enable the future flag in your app configuration:

  ```ts
  const shopify = shopifyApp({
    // ... other config
    future: {
      expiringOfflineAccessTokens: true,
    },
  });
  ```

  When enabled, calls to `shopify.authenticate.admin`, `shopify.authenticate.flow`, etc., will automatically handle token refreshing for offline sessions.

### Patch Changes

- Updated dependencies [a6a13bf]
- Updated dependencies [f1af47e]
  - @shopify/shopify-api@12.2.0
  - @shopify/shopify-app-session-storage@4.0.4

## 1.0.3

### Patch Changes

- f7e0d17: Resolve bug loading embedded app in POS when using React Router basename
- Updated dependencies [98f1be9]
  - @shopify/shopify-api@12.1.2
  - @shopify/shopify-app-session-storage@4.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [b3716f8]
  - @shopify/shopify-api@12.1.1
  - @shopify/shopify-app-session-storage@4.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [a6c4fed]
  - @shopify/shopify-api@12.1.0
  - @shopify/shopify-app-session-storage@4.0.1

## 1.0.0

### Major Changes

- 77cce3d: Release version 1 of the Remix app package.

  Provided you are already version `>=0.2.0` of the this is not a breaking change.

  If you are on version `<0.2.0` then this is a breaking change in some unlikely scenarios. Please see [this changelog entry](https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-app-react-router/CHANGELOG.md#020).

## 0.3.0

### Minor Changes

- 83381bc: When responding to Admin document requests add document response headers instructing the browser to:
  1. Preconnect to the Shopify CDN
  2. Preload Polaris and App Bridge

  This helps performance because the download of critical resources can start sooner and any assets these resources dynamically download will start with a warm connection pool.

## 0.2.0

### Minor Changes

- c02018f: **Note:** This is a breaking change, which is allowed in v0 packages, without incrementing major version numbers. However, [because the template is preconfigured with an API version](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/shopify.server.ts#L13) this will only affect you if you have changed the `apiVersion` to `LATEST_API_VERSION`.

  The `LATEST_API_VERSION` and `RELEASE_CANDIDATE_API_VERSION` constants have been removed from the package. The `apiVersion` parameter is now **required** in the `shopifyApp` configuration.

  We are making this change to ensure the API versions do not change without the developer explicitly opting into the new version. This removes the potential for apps to break unexpectedly and should reduce overall maintenance.

  ### Migration Steps

  #### Step 1: Update Your Imports

  **Before:**

  ```typescript
  import {
    LATEST_API_VERSION,
    shopifyApp,
  } from '@shopify/shopify-app-remix/server';
  // or
  import {
    RELEASE_CANDIDATE_API_VERSION,
    shopifyApp,
  } from '@shopify/shopify-app-remix/server';
  ```

  **After:**

  ```typescript
  import {ApiVersion, shopifyApp} from '@shopify/shopify-app-remix/server';
  ```

  #### Step 2: Update Your Configuration

  **Before:**

  ```typescript
  const shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    scopes: process.env.SCOPES?.split(',')!,
    appUrl: process.env.SHOPIFY_APP_URL!,
    apiVersion: LATEST_API_VERSION, // or omitted entirely
  });
  ```

  **After:**

  ```typescript
  const shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    scopes: process.env.SCOPES?.split(',')!,
    appUrl: process.env.SHOPIFY_APP_URL!,
    apiVersion: ApiVersion.July25, // Now required - choose your desired version
  });
  ```

- dc41d09: Require Node >= v20.10.0. Remove crypto dependency in favor of globalThis.crypto

  **Note:** Technically this is a breaking change. However, React Router and the [Shopify app template for React Router](https://github.com/Shopify/shopify-app-template-react-router) already require Node 20.10.0. So we don't think this will affect anyone. Semver allows V0 packages can have breaking changes without major version bumps.

  If you are using Node, make sure you are using Node version 20 or above

  If you are using `setCrypto` from `'@shopify/shopify-api'` you can remove this code.

### Patch Changes

- 1a8d614: Update the experimental script to point to polaris.js
- 79b2fbe: Swap semver package for compare-versions package. Compare versions is a lighter weight and suits the packages needs just fine
- Updated dependencies [dc41d09]
- Updated dependencies [c3005a6]
- Updated dependencies [dc41d09]
- Updated dependencies [a5be0d0]
- Updated dependencies [6606d39]
- Updated dependencies [48d3631]
- Updated dependencies [7d8aa81]
- Updated dependencies [089f4fd]
- Updated dependencies [dc41d09]
  - @shopify/shopify-api@12.0.0
  - @shopify/shopify-app-session-storage@4.0.0

## 0.1.1

### Patch Changes

- Updated dependencies [818450f]
  - @shopify/shopify-api@11.14.1
  - @shopify/shopify-app-session-storage@3.0.20

## 0.1.0

### Minor Changes

- 67aaf57:

### Early Access Shopify App React Router

This package is in early access. Most apps will be fine to adopt React Router. If you encounter issues [please provide feedback](https://github.com/Shopify/shopify-app-template-react-router/issues).

### Migrating from Remix

Use the [migration guide](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix) to migrate from the Shopify App Remix template.

### Patch Changes

- 447348f: Resolve bug with signal option on requests
- Updated dependencies [447348f]
- Updated dependencies [3d9457f]
- Updated dependencies [e298a0c]
- Updated dependencies [25bf95f]
  - @shopify/shopify-api@11.14.0
  - @shopify/admin-api-client@1.1.1
  - @shopify/storefront-api-client@1.0.9
  - @shopify/shopify-app-session-storage@3.0.19

This package was forked from the `@shopify/shopify-app-remix` package.

Read the [migration guide](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix) for how to migrate from `@shopify/shopify-app-remix` to `@shopify/shopify-app-react-router`.

# Remix

[@shopify/shopify-app-remix changelog](https://github.com/Shopify/shopify-app-remix/blob/main/CHANGELOG.md).
