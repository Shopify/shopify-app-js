# @shopify/shopify-app-session-storage-redis

## 1.1.8

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 1.1.7

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 1.1.6

### Patch Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0
- Updated dependencies [32296d7]
  - @shopify/shopify-app-session-storage@1.1.6

## 1.1.5

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency
- Updated dependencies [93e9126]
  - @shopify/shopify-app-session-storage@1.1.5

## 1.1.4

### Patch Changes

- b3453ff: Bumping @shopify/shopify-api dependency to latest version
- Updated dependencies [b3453ff]
  - @shopify/shopify-app-session-storage@1.1.4

## 1.1.3

### Patch Changes

- e1d4f4f: Add @shopify/shopify-api as a peerDependencies entry for each session-storage package, to avoid API library conflicts (e.g., scopesArray.map error). Should help avoid issues like #93
- de5fa79: Bumps [redis](https://github.com/redis/node-redis) from 4.6.5 to 4.6.6. See redis' [release](https://github.com/redis/node-redis/releases/tag/redis@4.6.6) for more details.
- 1d007e8: Bumps [@shopify/shopify-api](https://github.com/Shopify/shopify-api-js) from 7.0.0 to 7.1.0. See `@shopify/shopify-api`'s [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for more details.
- Updated dependencies [e1d4f4f]
- Updated dependencies [1d007e8]
  - @shopify/shopify-app-session-storage@1.1.3

## 1.1.2

### Patch Changes

- c9804ae: Bump redis from 4.6.4 to 4.6.5. See redis [release note](https://github.com/redis/node-redis/releases/tag/redis@4.6.5) for more details.
- e4f3415: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for details.
- 27467d8: Add event handlers to redis client to prevent crashing on disconnect event. Fixes #129, #160 (Thanks to @davidhollenbeckx for linking to issue and solution.)
- Updated dependencies [e4f3415]
  - @shopify/shopify-app-session-storage@1.1.2

## 1.1.1

### Patch Changes

- 97346b3: Fix #132: mysql migrator was unable to detect already applied migrations
- Updated dependencies [97346b3]
  - @shopify/shopify-app-session-storage@1.1.1

## 1.1.0

### Minor Changes

- becc305: Migrations capabilities that can handle persistence changes for all session storage implementations

### Patch Changes

- b6501b0: Bump typescript to 4.9.5
- Updated dependencies [b6501b0]
- Updated dependencies [becc305]
  - @shopify/shopify-app-session-storage@1.1.0

## 1.0.2

### Patch Changes

- 222b755: Updating @shopify/shopify-api to v6.1.0
- Updated dependencies [222b755]
  - @shopify/shopify-app-session-storage@1.0.2

## 1.0.1

### Patch Changes

- 1eccbd6: Optimize findSessionsByShop with additional shop-based key, listing array of corresponding session ids
- 866b50c: Update dependencies on shopify-api v6.0.2
- Updated dependencies [866b50c]
  - @shopify/shopify-app-session-storage@1.0.1

## 1.0.0

### Major Changes

- Initial public release of @shopify/shopify-app-session-storage-redis
