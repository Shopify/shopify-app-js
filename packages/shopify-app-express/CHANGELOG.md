# Changelog

## 4.1.4

### Patch Changes

- 4aa4b59: Bump shopify-api to v9.6.0
- Updated dependencies [4aa4b59]
  - @shopify/shopify-app-session-storage-memory@3.0.3
  - @shopify/shopify-app-session-storage@2.1.3

## 4.1.3

### Patch Changes

- ee3c852: increase max body size to 500kb
- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1
- Updated dependencies [3938adc]
- Updated dependencies [c6c975f]
  - @shopify/shopify-app-session-storage-memory@3.0.2
  - @shopify/shopify-app-session-storage@2.1.2

## 4.1.2

### Patch Changes

- 6deb1bd: Updated dependency on `semver`

## 4.1.1

### Patch Changes

- b1ddc74: Return a 403 with X-Shopify headers on XHR requests for non-embedded apps, instead of a 302. The 302 ran into CORS errors and always failed.

  These requests will return the following headers:

  - `X-Shopify-Api-Request-Failure-Reauthorize`: `1`
  - `X-Shopify-Api-Request-Failure-Reauthorize-Url`: <URL>

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2
- Updated dependencies [02a8341]
- Updated dependencies [321d6a4]
  - @shopify/shopify-app-session-storage-memory@3.0.1
  - @shopify/shopify-app-session-storage@2.1.1

## 4.1.0

### Minor Changes

- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- f5742c1: Updated dependency on `@shopify/shopify-api`
- Updated dependencies [f5742c1]
- Updated dependencies [64e0246]
  - @shopify/shopify-app-session-storage-memory@3.0.0
  - @shopify/shopify-app-session-storage@2.1.0

## 4.0.1

### Patch Changes

- b4eeb24: Improved and simplified package.json dependencies
- b998c30: Bump shopify-api version from 9.0.1 to 9.0.2
- d8f8436: Replaced query() internal call in the GraphQL client with request()
- Updated dependencies [b4eeb24]
- Updated dependencies [b998c30]
  - @shopify/shopify-app-session-storage-memory@2.0.4
  - @shopify/shopify-app-session-storage@2.0.4

## 4.0.0

### Major Changes

- d3e4b5e: Updated `@shopify/shopify-api` to the latest major version. Please follow [the v9 migration guide](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/migrating-to-v9.md) to update your app.

### Patch Changes

- Updated dependencies [d3e4b5e]
  - @shopify/shopify-app-session-storage-memory@2.0.3
  - @shopify/shopify-app-session-storage@2.0.3

## 3.0.2

### Patch Changes

- 3685bd4: Bump shopify-api to ^8.1.1
- Updated dependencies [3685bd4]
  - @shopify/shopify-app-session-storage-memory@2.0.2
  - @shopify/shopify-app-session-storage@2.0.2

## 3.0.1

### Patch Changes

- 6d12840: Updating dependencies on @shopify/shopify-api
- Updated dependencies [6d12840]
  - @shopify/shopify-app-session-storage-memory@2.0.1
  - @shopify/shopify-app-session-storage@2.0.1

## 3.0.0

### Major Changes

- f837060: **Removed support for Node 14**

  Node 14 has reached its [EOL](https://endoflife.date/nodejs), and dependencies to this package no longer work on Node 14.
  Because of that, we can no longer support that version.

  If your app is running on Node 14, you'll need to update to a more recent version before upgrading this package.

  This upgrade does not require any code changes.

#### Changes to the `ShopifyApp` type

Previously, the `ShopifyApp` type accepted 2 generic types: the REST resources and the session storage class.
In v3, that type accepts 1 generic: the params given to the `shopifyApp()` function, which contains both of the previous types, and more.

Apps shouldn't need to use that type directly since `shopifyApp()` is able to extract the types from the parameters it's given.
If you need to explicitly set those generics, you'll need to use the `AppConfigParams` type.

<details>
<summary>See an example</summary>

Before:

```ts
import { ShopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

const myVariable: ShopifyApp<typeof restResources, MemorySessionStorage>;
```

After:

```ts
import { ShopifyApp, AppConfigParams } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

const myVariable: ShopifyApp<
  AppConfigParams<typeof restResources, MemorySessionStorage>
>;
```

</details>

### Patch Changes

- a69d6fc: Updating dependency on @shopify/shopify-api to v.8.0.1
- Updated dependencies [f837060]
- Updated dependencies [a69d6fc]
  - @shopify/shopify-app-session-storage@2.0.0
  - @shopify/shopify-app-session-storage-memory@2.0.0

## 2.2.4

### Patch Changes

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0
- Updated dependencies [616388d]
  - @shopify/shopify-app-session-storage-memory@1.0.13
  - @shopify/shopify-app-session-storage@1.1.10

## 2.2.3

### Patch Changes

- 5b862fe: Upgraded shopify-api dependency to 7.6.0
- Updated dependencies [5b862fe]
  - @shopify/shopify-app-session-storage-memory@1.0.12
  - @shopify/shopify-app-session-storage@1.1.9

## 2.2.2

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage-memory@1.0.11
  - @shopify/shopify-app-session-storage@1.1.8

## 2.2.1

### Patch Changes

- 0c46a39: Fixing CSP header for internal Shopify use
- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage-memory@1.0.10
  - @shopify/shopify-app-session-storage@1.1.7

## 2.2.0

### Minor Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0

### Patch Changes

- Updated dependencies [32296d7]
  - @shopify/shopify-app-session-storage-memory@1.0.9
  - @shopify/shopify-app-session-storage@1.1.6

## 2.1.4

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency
- Updated dependencies [93e9126]
  - @shopify/shopify-app-session-storage-memory@1.0.8
  - @shopify/shopify-app-session-storage@1.1.5

## 2.1.3

### Patch Changes

- bf91be6: [Internal] Improved tracking of GraphQL calls made by the package
- b3453ff: Bumping @shopify/shopify-api dependency to latest version
- Updated dependencies [b3453ff]
  - @shopify/shopify-app-session-storage-memory@1.0.7
  - @shopify/shopify-app-session-storage@1.1.4

## 2.1.2

### Patch Changes

- 2f10cdd: Bumps [semver](https://github.com/npm/node-semver) from 7.5.0 to 7.5.1. See `semver`'s [release notes](https://github.com/npm/node-semver/releases) for more details.

## 2.1.1

### Patch Changes

- f8978a5: Add `X-Shopify-Api-Request-Failure-Reauthorize` and `X-Shopify-Api-Request-Failure-Reauthorize-Url` to `Access-Control-Expose-Headers` when redirecting using headers via App Bridge.
- 553fd67: Respond with 410 to OAuth requests that are initiated by a bot, using bot detection mechanism introduced in 7.1.0 of API library.
- f40fede: Bumps [semver](https://github.com/npm/node-semver) from 7.4.0 to 7.5.0. See semver [changelog](https://github.com/npm/node-semver/blob/main/CHANGELOG.md) for more details.
- 1d007e8: Bumps [@shopify/shopify-api](https://github.com/Shopify/shopify-api-js) from 7.0.0 to 7.1.0. See `@shopify/shopify-api`'s [changelog](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/CHANGELOG.md) for more details.
- Updated dependencies [e1d4f4f]
- Updated dependencies [1d007e8]
  - @shopify/shopify-app-session-storage@1.1.3
  - @shopify/shopify-app-session-storage-memory@1.0.6

## 2.1.0

### Minor Changes

- bdfd30b: Add redirectOutOfApp function to shopifyApp object, which allows apps to redirect out of the app (e.g. for OAuth or billing) regardless of how the request was set up

## 2.0.0

### Major Changes

- 814a9c1: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/CHANGELOG.md) for details.

  ⚠️ [Breaking] Refer to the [6 to 7 migration guide](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/migrating-to-v7.md) for more details on how the `.api` property returned by `shopifyApp` may be impacted by this release of the API library.

  ⚠️ [Breaking] If your app is using the logging methods of the `.config.logger` property returned by `shopifyApp`, it is no longer `async`.

### Patch Changes

- 49cdf3f: Bump semver from 7.3.8 to 7.4.0. See [changelog](https://github.com/npm/node-semver/blob/main/CHANGELOG.md) for details.
- Updated dependencies [e4f3415]
  - @shopify/shopify-app-session-storage-memory@1.0.5
  - @shopify/shopify-app-session-storage@1.1.2

## 1.2.2

### Patch Changes

- Updated dependencies [97346b3]
  - @shopify/shopify-app-session-storage@1.1.1
  - @shopify/shopify-app-session-storage-memory@1.0.4

## 1.2.1

### Patch Changes

- 719f289: Attempt to set shop from token, if present and if no shop param provided or no session found in database. Fixes #94
- e0fddde: ensureInstalledOnShop - catch error if host param is missing, return 400. Fixes #81

## 1.2.0

### Minor Changes

- becc305: Migrations capabilities that can handle persistence changes for all session storage implementations

### Patch Changes

- b20b498: Bump supertest to 6.3.3
- 8a4be18: Bump to Mongodb 5.0.0
- b699a5b: Bump mongodb to 4.13.0
- b6501b0: Bump typescript to 4.9.5
- 348b5af: Bump @ypes/pg to 8.6.6
- cf34f7d: Bump @types/express to 4.17.16
- Updated dependencies [b6501b0]
- Updated dependencies [becc305]
  - @shopify/shopify-app-session-storage-memory@1.0.3
  - @shopify/shopify-app-session-storage@1.1.0

## 1.1.0

### Minor Changes

- 222b755: Updating @shopify/shopify-api to v6.1.0

### Patch Changes

- Updated dependencies [222b755]
  - @shopify/shopify-app-session-storage@1.0.2
  - @shopify/shopify-app-session-storage-memory@1.0.2

## 1.0.2

### Patch Changes

- 1eccbd6: Gracefully handle session errors in validateAuthenticatedSession
- 1eccbd6: Check if session is valid before embedding into the Shopify Admin
- 866b50c: Update dependencies on shopify-api v6.0.2
- Updated dependencies [866b50c]
  - @shopify/shopify-app-session-storage@1.0.1
  - @shopify/shopify-app-session-storage-memory@1.0.1

## 1.0.1

### Patch Changes

- d72952e: Allow both online and offline tokens with a single package instance

## 1.0.0

### Major Changes

- Initial public release of @shopify/shopify-app-express
