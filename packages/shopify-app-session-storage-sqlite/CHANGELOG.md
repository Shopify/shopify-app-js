# @shopify/shopify-app-session-storage-sqlite

## 1.2.1

### Patch Changes

- e4f3415: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md) for details.
- 9ebfdf1: Bump sqlite3 from 5.1.4 to 5.1.6. See sqlite3 [release notes](https://github.com/TryGhost/node-sqlite3/releases) for details.
- Updated dependencies [e4f3415]
  - @shopify/shopify-app-session-storage@1.1.2

## 1.2.0

### Minor Changes

- 7e55407: Allow sqlite3.Database object as argument for SQLiteSessionStorage constructor

### Patch Changes

- 97346b3: Fix #132: mysql migrator was unable to detect already applied migrations
- Updated dependencies [97346b3]
  - @shopify/shopify-app-session-storage@1.1.1

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

- Initial public release of @shopify/shopify-app-session-storage-sqlite
