# Changelog

## 2.0.0

### Major Changes

- 814a9c1: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for details.

  ⚠️ [Breaking] Refer to the [6 to 7 migration guide](https://github.com/Shopify/shopify-api-js/blob/main/docs/migrating-to-v7.md) for more details on how the `.api` property returned by `shopifyApp` may be impacted by this release of the API library.

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
