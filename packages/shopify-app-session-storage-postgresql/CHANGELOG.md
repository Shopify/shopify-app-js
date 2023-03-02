# @shopify/shopify-app-session-storage-postgresql

## 1.1.1

### Patch Changes

- 97346b3: Fix #132: mysql migrator was unable to detect already applied migrations
- Updated dependencies [97346b3]
  - @shopify/shopify-app-session-storage@1.1.1

## 1.1.0

### Minor Changes

- becc305: Migrations capabilities that can handle persistence changes for all session storage implementations

### Patch Changes

- 8cadd09: Modify postgres to make table and column names case sensitive. Fixes Shopify/shopify-api-js#460
- 8f5749f: Increase size of 'scope' column to 1024 for session storage implementation for RDBMS
- eaa6b18: Update to support PostgreSQL v15 breaking changes
- b6501b0: Bump typescript to 4.9.5
- 348b5af: Bump @ypes/pg to 8.6.6
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

- 1eccbd6: Reapply a fix for a bug where the PostgreSQL session storage always attempted to create the sessions table
- 866b50c: Update dependencies on shopify-api v6.0.2
- Updated dependencies [866b50c]
  - @shopify/shopify-app-session-storage@1.0.1

## 1.0.0

### Major Changes

- Initial public release of @shopify/shopify-app-session-storage-postgresql
