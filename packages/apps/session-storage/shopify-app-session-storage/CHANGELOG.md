# @shopify/shopify-app-session-storage

## 3.0.20

## 3.0.19

### Patch Changes

- e298a0c: Fix issue with missing sourcemaps

## 3.0.18

## 3.0.17

### Patch Changes

- 981c948: Update directory path

## 3.0.16

## 3.0.15

## 3.0.14

## 3.0.13

## 3.0.12

## 3.0.11

## 3.0.10

## 3.0.9

## 3.0.8

## 3.0.7

## 3.0.6

## 3.0.5

## 3.0.4

## 3.0.3

## 3.0.2

## 3.0.1

## 3.0.0

### Major Changes

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.

### Minor Changes

- 36e3c62: Add support for Node 22.

### Patch Changes

- Updated dependencies [d9f2601]
- Updated dependencies [92b6772]
- Updated dependencies [b5a4735]
- Updated dependencies [a42efff]
- Updated dependencies [9749f45]
- Updated dependencies [36e3c62]
- Updated dependencies [6970109]
  - @shopify/shopify-api@11.0.0

## 2.1.5

### Patch Changes

- a8d4b3e: Updated @shopify/shopify-api dependency to also allow v10+ since there were no breaking changes affecting this package.

## 2.1.4

### Patch Changes

- Updated dependencies [16f52ee]
- Updated dependencies [8c97e8a]
  - @shopify/shopify-api@9.7.2

## 2.1.3

### Patch Changes

- 4aa4b59: Bump shopify-api to v9.6.0
- 883fe7b: Bumps @shopify/shopify-api to v9.6.2
- 753d406: Update @shopify/shopify-api to v9.7.1

## 2.1.2

### Patch Changes

- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1

## 2.1.1

### Patch Changes

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2

## 2.1.0

### Minor Changes

- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- f5742c1: Updated dependency on `@shopify/shopify-api`

## 2.0.4

### Patch Changes

- b4eeb24: Improved and simplified package.json dependencies
- b998c30: Bump shopify-api version from 9.0.1 to 9.0.2

## 2.0.3

### Patch Changes

- d3e4b5e: Updated the dependency on `@shopify/shopify-api`

## 2.0.2

### Patch Changes

- 3685bd4: Bump shopify-api to ^8.1.1

## 2.0.1

### Patch Changes

- 6d12840: Updating dependencies on @shopify/shopify-api

## 2.0.0

### Major Changes

- f837060: **Removed support for Node 14**

  Node 14 has reached its [EOL](https://endoflife.date/nodejs), and dependencies to this package no longer work on Node 14.
  Because of that, we can no longer support that version.

  If your app is running on Node 14, you'll need to update to a more recent version before upgrading this package.

  This upgrade does not require any code changes.

### Patch Changes

- a69d6fc: Updating dependency on @shopify/shopify-api to v.8.0.1

## 1.1.10

### Patch Changes

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0

## 1.1.9

### Patch Changes

- 5b862fe: Upgraded shopify-api dependency to 7.6.0

## 1.1.8

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api

## 1.1.7

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version

## 1.1.6

### Patch Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0

## 1.1.5

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency

## 1.1.4

### Patch Changes

- b3453ff: Bumping @shopify/shopify-api dependency to latest version

## 1.1.3

### Patch Changes

- e1d4f4f: Add @shopify/shopify-api as a peerDependencies entry for each session-storage package, to avoid API library conflicts (e.g., scopesArray.map error). Should help avoid issues like #93
- 1d007e8: Bumps [@shopify/shopify-api](../../shopify-api) from 7.0.0 to 7.1.0. See `@shopify/shopify-api`'s [changelog](../../shopify-api/CHANGELOG.md) for more details.

## 1.1.2

### Patch Changes

- e4f3415: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](../../shopify-api/CHANGELOG.md) for details.

## 1.1.1

### Patch Changes

- 97346b3: Fix #132: mysql migrator was unable to detect already applied migrations

## 1.1.0

### Minor Changes

- becc305: Migrations capabilities that can handle persistence changes for all session storage implementations

### Patch Changes

- b6501b0: Bump typescript to 4.9.5

## 1.0.2

### Patch Changes

- 222b755: Updating @shopify/shopify-api to v6.1.0

## 1.0.1

### Patch Changes

- 866b50c: Update dependencies on shopify-api v6.0.2

## 1.0.0

### Major Changes

- Initial public release of @shopify/shopify-app-session-storage
