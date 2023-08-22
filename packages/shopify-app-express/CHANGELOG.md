# Changelog

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
- 1d007e8: Bumps [@shopify/shopify-api](https://github.com/Shopify/shopify-api-js) from 7.0.0 to 7.1.0. See `@shopify/shopify-api`'s [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for more details.
- Updated dependencies [e1d4f4f]
- Updated dependencies [1d007e8]
  - @shopify/shopify-app-session-storage@1.1.3
  - @shopify/shopify-app-session-storage-memory@1.0.6

## 2.1.0

### Minor Changes

- bdfd30b: Add redirectOutOfApp function to shopifyApp object, which allows apps to redirect out of the app (e.g. for OAuth or billing) regardless of how the request was set up

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
