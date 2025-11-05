# @shopify/shopify-app-react-router

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
