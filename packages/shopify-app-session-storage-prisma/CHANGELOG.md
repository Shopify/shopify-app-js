# @shopify/shopify-app-session-storage-prisma

## 4.0.3

### Patch Changes

- 4aa4b59: Bump shopify-api to v9.6.0
- Updated dependencies [4aa4b59]
  - @shopify/shopify-app-session-storage@2.1.3

## 4.0.2

### Patch Changes

- 3bc4195: Handle Prisma error P2002 during upsert
- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1
- e192b61: Bumps @prisma/client from 5.9.1 to 5.10.2.
- Updated dependencies [3938adc]
- Updated dependencies [c6c975f]
  - @shopify/shopify-app-session-storage@2.1.2

## 4.0.1

### Patch Changes

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2
- 56c2198: Bumps @prisma/client from 5.8.1 to 5.9.1.
- 2d5181b: Add error cause when throwing MissingSessionTableError
- Updated dependencies [02a8341]
- Updated dependencies [321d6a4]
  - @shopify/shopify-app-session-storage@2.1.1

## 4.0.0

### Minor Changes

- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- f5742c1: Updated dependency on `@shopify/shopify-api`
- Updated dependencies [f5742c1]
- Updated dependencies [64e0246]
  - @shopify/shopify-app-session-storage@2.1.0

## 3.0.0

### Major Changes

- ea88df2: Updated the dependency on `prisma` to v5+. This package itself has no breaking changes, but you'll need to update your app's dependency on Prisma as well as this package.

### Patch Changes

- b4eeb24: Improved and simplified package.json dependencies
- b998c30: Bump shopify-api version from 9.0.1 to 9.0.2
- Updated dependencies [b4eeb24]
- Updated dependencies [b998c30]
  - @shopify/shopify-app-session-storage@2.0.4

## 2.0.3

### Patch Changes

- d3e4b5e: Updated the dependency on `@shopify/shopify-api`
- Updated dependencies [d3e4b5e]
  - @shopify/shopify-app-session-storage@2.0.3

## 2.0.2

### Patch Changes

- 3685bd4: Bump shopify-api to ^8.1.1
- Updated dependencies [3685bd4]
  - @shopify/shopify-app-session-storage@2.0.2

## 2.0.1

### Patch Changes

- 6d12840: Updating dependencies on @shopify/shopify-api
- Updated dependencies [6d12840]
  - @shopify/shopify-app-session-storage@2.0.1

## 2.0.0

### Major Changes

- f837060: **Removed support for Node 14**

  Node 14 has reached its [EOL](https://endoflife.date/nodejs), and dependencies to this package no longer work on Node 14.
  Because of that, we can no longer support that version.

  If your app is running on Node 14, you'll need to update to a more recent version before upgrading this package.

  This upgrade does not require any code changes.

### Patch Changes

- a69d6fc: Updating dependency on @shopify/shopify-api to v.8.0.1
- Updated dependencies [f837060]
- Updated dependencies [a69d6fc]
  - @shopify/shopify-app-session-storage@2.0.0

## 1.1.1

### Patch Changes

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0
- Updated dependencies [616388d]
  - @shopify/shopify-app-session-storage@1.1.10

## 1.1.0

### Minor Changes

- 695f829: Allow using custom tables for the Prisma session storage.

### Patch Changes

- 5b862fe: Upgraded shopify-api dependency to 7.6.0
- Updated dependencies [5b862fe]
  - @shopify/shopify-app-session-storage@1.1.9

## 1.0.5

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 1.0.4

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 1.0.3

### Patch Changes

- 90a62de: Throw a specific error when the database doesn't exist to help indicate that a migration might be needed

## 1.0.2

### Patch Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0
- Updated dependencies [32296d7]
  - @shopify/shopify-app-session-storage@1.1.6

## 1.0.1

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency
- Updated dependencies [93e9126]
  - @shopify/shopify-app-session-storage@1.1.5

## 1.0.0

### Major Changes

- Initial release of @shopify/shopify-app-session-storage-prisma
