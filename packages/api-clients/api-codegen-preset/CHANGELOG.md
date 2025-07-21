# Changelog

## 1.1.9

### Patch Changes

- f645da4: Updated `@graphql-codegen/cli` dependencies
- e298a0c: Fix issue with missing sourcemaps

## 1.1.8

### Patch Changes

- 1e694e9: Updated `@parcel/watcher` dependencies
- fc54fc2: Updated `@graphql-codegen/typescript` dependencies

## 1.1.7

### Patch Changes

- 981c948: Update directory path

## 1.1.6

### Patch Changes

- 4adbc2b: # Generate Provenance Statements

  This changes no functionality.

  The provenance attestation is established by publicly providing a link to a package's source code and build instructions from the build environment. This allows developers to verify where and how your package was built before they download it.

  Learn more about [npm provenance](https://docs.npmjs.com/generating-provenance-statements#about-npm-provenance)

## 1.1.5

### Patch Changes

- 6727c3c: Updated `@graphql-codegen/cli` dependencies
- acbe27b: Updated `@graphql-codegen/typescript` dependencies

## 1.1.4

### Patch Changes

- 694092c: Updated `@graphql-codegen/typescript` dependencies
- 12ab42a: Updated `graphql` dependencies

## 1.1.3

### Patch Changes

- cd39dff: Updated `@parcel/watcher` dependencies

## 1.1.2

### Patch Changes

- 8c089b4: Updated `@graphql-codegen/typescript` dependencies
- 0c5501b: Updated `@graphql-codegen/cli` dependencies
- 827085d: Updated `@graphql-codegen/typescript` dependencies

## 1.1.1

### Patch Changes

- 77aa5cc: Improved type safety of generated configurations

## 1.1.0

### Minor Changes

- 4101a85: Added the [customer API](https://shopify.dev/docs/api/customer) as a codegen preset

### Patch Changes

- 00b542a: Pinned `graphql-config` version to prevent a forced upgrade to Node 20+

## 1.0.1

### Patch Changes

- 50ead0a: type imports in generated codegen files will not include the extension

## 1.0.0

### Major Changes

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.

### Minor Changes

- 36e3c62: Add support for Node 22.
- 51f257b: Updated dependency on `@shopify/graphql-codegen`, which can now output regular .ts files in addition to .d.ts files, which will allow apps to import enums from the `.types.ts` file in their code.

  If you're using `shopifyApiProject` or `shopifyApiTypes`, you can pass in a new `declarations` setting, which defaults to true to maintain the previous behaviour:

  ```diff
  // For shopifyApiProject
  export default {
    ...
    projects: {
      default: shopifyApiProject({
        apiType: ApiType.Admin,
        apiVersion: '2023-10',
        documents: ['./app/**/*.{js,ts,jsx,tsx}'],
        outputDir: './app/types',
  +     declarations: false,
      }),
    },
  };

  // For shopifyApiTypes
  export default {
    ...
    projects: {
      // To produce variable / return types for Admin API operations
      schema: 'https://shopify.dev/admin-graphql-direct-proxy/2023-10',
      documents: ['./app/**/*.{js,ts,jsx,tsx}'],
      extensions: {
        codegen: {
          pluckConfig,
          generates: shopifyApiTypes({
            apiType: ApiType.Admin,
            apiVersion: '2023-10',
            documents: ['./app/**/*.{js,ts,jsx,tsx}'],
            outputDir: './app/types',
  +         declarations: false,
          }),
        },
      },
    },
  };
  ```

  If you're using the preset directly, you just need to change your output files to `.ts`:

  ```diff
  export default {
    ...
    projects: {
      default: {
        schema: 'https://shopify.dev/admin-graphql-direct-proxy',
        documents: ['./**/*.{js,ts,jsx,tsx}'],
        extensions: {
          codegen: {
            // Enables support for `#graphql` tags, as well as `/* GraphQL */`
            pluckConfig,
            generates: {
              './types/admin.schema.json': {
                plugins: ['introspection'],
                config: {minify: true},
              },
  -           './types/admin.types.d.ts': {
  +           './types/admin.types.ts': {
                plugins: ['typescript'],
              },
  -           './types/admin.generated.d.ts': {
  +           './types/admin.generated.ts': {
                preset,
                presetConfig: {
                  apiType: ApiType.Admin,
                },
              },
            },
          },
        },
      },
    },
  };
  ```

### Patch Changes

- faf7ad5: Use type imports in generated codegen files.
- 4a915a0: Updated dependency on @graphql-codegen/typescript

## 0.0.7

### Patch Changes

- d86dc11: Bumps @graphql-codegen/introspection from 4.0.0 to 4.0.3.

## 0.0.6

### Patch Changes

- dba2232: Bumps @graphql-codegen/cli from 5.0.0 to 5.0.2.
- edb4bb0: Bumps @parcel/watcher from 2.4.0 to 2.4.1.

## 0.0.5

### Patch Changes

- 8e06306: Replaced @shopify/hydrogen-codegen with its more generic successor, @shopify/graphql-codegen. All of the changes are internal, so this package is unchanged.

## 0.0.4

### Patch Changes

- 37f1b7b: Updated dependency on @shopify/hydrogen-codegen

## 0.0.3

### Patch Changes

- e10395ca: Update @graphql-codegen/typescript from 4.0.1 to 4.0.4.

## 0.0.2

### Patch Changes

- 6ed8499a: Update @shopify/hydrogen-codegen from 0.1.0 to 0.2.0.
- 284f2cf2: Update @parcel/watcher from 2.3.0 to 2.4.0.
