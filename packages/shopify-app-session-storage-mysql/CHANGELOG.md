# @shopify/shopify-app-session-storage-mysql

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
