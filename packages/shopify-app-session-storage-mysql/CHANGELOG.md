# @shopify/shopify-app-session-storage-mysql

## 1.1.11

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 1.1.10

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 1.1.9

### Patch Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0
- Updated dependencies [32296d7]
  - @shopify/shopify-app-session-storage@1.1.6

## 1.1.8

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency
- Updated dependencies [93e9126]
  - @shopify/shopify-app-session-storage@1.1.5

## 1.1.7

### Patch Changes

- b3453ff: Bumping @shopify/shopify-api dependency to latest version
- Updated dependencies [b3453ff]
  - @shopify/shopify-app-session-storage@1.1.4

## 1.1.6

### Patch Changes

- f5bb9f1: Bumps [mysql2](https://github.com/sidorares/node-mysql2) from 3.3.0 to 3.3.1. See mysql2's [changelog](https://github.com/sidorares/node-mysql2/blob/master/Changelog.md) for more details.

## 1.1.5

### Patch Changes

- e1d4f4f: Add @shopify/shopify-api as a peerDependencies entry for each session-storage package, to avoid API library conflicts (e.g., scopesArray.map error). Should help avoid issues like #93
- 2dd9ba5: Bumps [mysql2](Bumps mysql2 from 3.2.1 to 3.2.4.) from 3.2.1 to 3.2.4. See mysql2 [changelog](https://github.com/sidorares/node-mysql2/blob/master/Changelog.md) for more details.
- 1d007e8: Bumps [@shopify/shopify-api](https://github.com/Shopify/shopify-api-js) from 7.0.0 to 7.1.0. See `@shopify/shopify-api`'s [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for more details.
- 9aaf402: Bumps [mysql2](https://github.com/sidorares/node-mysql2) from 3.2.4 to 3.3.0. See mysql2's [changelog](https://github.com/sidorares/node-mysql2/blob/master/Changelog.md) for more details.
- Updated dependencies [e1d4f4f]
- Updated dependencies [1d007e8]
  - @shopify/shopify-app-session-storage@1.1.3

## 1.1.4

### Patch Changes

- d6171e2: Bump mysql2 from 3.2.0 to 3.2.1. See [mysql2 changelog](https://github.com/sidorares/node-mysql2/blob/master/Changelog.md#321-2023-04-13) for details.
- 9a65092: In 1.0.2 of MySQLSessionStorage, the constructor could accept either a URL object or a URL string. The string option was accidentally removed, starting 1.1.0. This patch adds it back in. Fixes #204

## 1.1.3

### Patch Changes

- 335c8df: MySQL session storage to use a connection pool instead of a single client connection. Fixes #150, #185
- 502b4c7: Bumps mysql2 from 3.1.2 to 3.2.0.
- e4f3415: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for details.
- 3969855: Use decodeURIComponent on password, user, database name fields prior to calling underlying MySQL connection. Fixes #163. Also applied to postgresql adapter.
- Updated dependencies [e4f3415]
  - @shopify/shopify-app-session-storage@1.1.2

## 1.1.2

### Patch Changes

- 97346b3: Fix #132: mysql migrator was unable to detect already applied migrations
- Updated dependencies [97346b3]
  - @shopify/shopify-app-session-storage@1.1.1

## 1.1.1

### Patch Changes

- a37f9db: Bump mysql2 to 3.1.2

## 1.1.0

### Minor Changes

- becc305: Migrations capabilities that can handle persistence changes for all session storage implementations

### Patch Changes

- 8f5749f: Increase size of 'scope' column to 1024 for session storage implementation for RDBMS
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

- 866b50c: Update dependencies on shopify-api v6.0.2
- Updated dependencies [866b50c]
  - @shopify/shopify-app-session-storage@1.0.1

## 1.0.0

### Major Changes

- Initial public release of @shopify/shopify-app-session-storage-mysql
