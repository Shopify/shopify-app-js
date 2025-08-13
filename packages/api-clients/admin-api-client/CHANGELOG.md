# @shopify/admin-api-client

## 1.1.1

### Patch Changes

- e298a0c: Fix issue with missing sourcemaps
- Updated dependencies [056f464]
- Updated dependencies [447348f]
- Updated dependencies [e298a0c]
  - @shopify/graphql-client@1.4.1

## 1.1.0

### Minor Changes

- b05d09b: # Add Logging for Shopify GraphQL Admin API Deprecated Reason

  Enable logging to now show any detected detected deprecations from the Shopify GraphQL Admin API.

  For more information about deprecation detection see the [Shopify.dev Changelog](https://shopify.dev/changelog/graphql-return-actual-deprecation-reasons)

  ## Example Usage

  ### [@shopify/shopify-api](https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-api/#readme)

  Enable logging for `httpRequests` to now show any detected deprecations from the Shopify GraphQL Admin API.

  ```js
  const shopify = shopifyApi({
    apiKey: 'APIKeyFromPartnersDashboard',
    apiSecretKey: 'APISecretFromPartnersDashboard',
    logger: {
      httpRequests: true // Enable httpRequest logging
    }
    ...
  ```

  ### [@shopify/admin-api-client](https://github.com/Shopify/shopify-app-js/blob/main/packages/api-clients/admin-api-client/#readme)

  Enable logging to now show any detected deprecations from the Shopify GraphQL Admin API.

  ```js
  import {createAdminApiClient} from '@shopify/admin-api-client';

  const client = createAdminApiClient({
    storeDomain: 'your-shop-name.myshopify.com',
    apiVersion: '2025-01',
    accessToken: 'your-admin-api-access-token',
    logger: (logContent: LogContent) => {
      switch (logContent.type) {
        case 'HTTP-Response': {
          const responseLog: HTTPResponseLog['content'] = logContent.content;
          console.debug('Received response for HTTP request', {
            requestParams: JSON.stringify(responseLog.requestParams),
            response: JSON.stringify(responseLog.response),
          });
          break;
        }
        case 'HTTP-Retry': {
          const responseLog: HTTPRetryLog['content'] = logContent.content;
          console.info('Retrying HTTP request', {
            requestParams: JSON.stringify(responseLog.requestParams),
            retryAttempt: responseLog.retryAttempt,
            maxRetries: responseLog.maxRetries,
            response: JSON.stringify(responseLog.lastResponse),
          });
          break;
        }
        case 'HTTP-Response-GraphQL-Deprecation-Notice': {
          const responseLog: HTTPResponseGraphQLDeprecationNotice['content'] = logContent.content;
          console.warn('Received response containing Deprecated GraphQL Notice', {
            requestParams: JSON.stringify(responseLog.requestParams),
            deprecationNotice: responseLog.deprecationNotice,
          });
          break;
        }
        default: {
          console.debug(`HTTP request event: ${logContent.content}`);
          break;
        }
      }
    };
  });
  ```

### Patch Changes

- Updated dependencies [b05d09b]
  - @shopify/graphql-client@1.4.0

## 1.0.8

### Patch Changes

- 981c948: Update directory path
- Updated dependencies [981c948]
  - @shopify/graphql-client@1.3.2

## 1.0.7

### Patch Changes

- 4adbc2b: # Generate Provenance Statements

  This changes no functionality.

  The provenance attestation is established by publicly providing a link to a package's source code and build instructions from the build environment. This allows developers to verify where and how your package was built before they download it.

  Learn more about [npm provenance](https://docs.npmjs.com/generating-provenance-statements#about-npm-provenance)

- Updated dependencies [4adbc2b]
  - @shopify/graphql-client@1.3.1

## 1.0.6

### Patch Changes

- Updated dependencies [4603b69]
  - @shopify/graphql-client@1.3.0

## 1.0.5

### Patch Changes

- Updated dependencies [d3531c5]
  - @shopify/graphql-client@1.2.2

## 1.0.4

### Patch Changes

- Updated dependencies [f38dfc0]
  - @shopify/graphql-client@1.2.1

## 1.0.3

### Patch Changes

- 97c31fb: Fix issue with tsconfig.json causing intellisense errors

## 1.0.2

### Patch Changes

- Updated dependencies [ada2cc3]
  - @shopify/graphql-client@1.2.0

## 1.0.1

### Patch Changes

- Updated dependencies [1aa226b]
- Updated dependencies [5bf588d]
  - @shopify/graphql-client@1.1.0

## 1.0.0

### Major Changes

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.

### Minor Changes

- 36e3c62: Add support for Node 22.

### Patch Changes

- Updated dependencies [36e3c62]
- Updated dependencies [6970109]
  - @shopify/graphql-client@1.0.0

## 0.2.9

### Patch Changes

- Updated dependencies [715a120]
  - @shopify/graphql-client@0.10.4

## 0.2.8

### Patch Changes

- Updated dependencies [e9652b7]
  - @shopify/graphql-client@0.10.3

## 0.2.7

### Patch Changes

- Updated dependencies [2f862e3]
- Updated dependencies [b2f29ae]
  - @shopify/graphql-client@0.10.2

## 0.2.6

### Patch Changes

- Updated dependencies [56d2fcd]
  - @shopify/graphql-client@0.10.1

## 0.2.5

### Patch Changes

- 9df4bacf: Add new `requestStream()` function to support streamed responses from Storefront API
- Updated dependencies [9df4bacf]
  - @shopify/graphql-client@0.10.0

## 0.2.4

### Patch Changes

- Updated dependencies [295859d6]
  - @shopify/graphql-client@0.9.4

## 0.2.3

### Patch Changes

- 0f0ffb8a: Updated global fetch types to more closely match reality
- Updated dependencies [0f0ffb8a]
  - @shopify/graphql-client@0.9.3

## 0.2.2

### Patch Changes

- b2414c2f: Remove `Partial` around the `ClientResponse.data` type for easier consumption of the client's returned typed data
- Updated dependencies [b2414c2f]
  - @shopify/graphql-client@0.9.2

## 0.2.1

### Patch Changes

- Updated dependencies [a23cd941]
  - @shopify/graphql-client@0.9.1

## 0.2.0

### Minor Changes

- 0286e7fe: Export a REST API client from `admin-api-client`, with an API that is similar to the GraphQL client.
- 18781092: Updated shopify-api GraphQL clients' APIs to be closer to the underlying clients
- 2b9e06f6: Add the raw network response object to `ResponseErrors`
- 194ddcf2: Update api version validation error, generic error messages and client types
- c9622cd7: Update `UNSUPPORTED_API_VERSION` log type to `Unsupported_Api_Version` for consistent log type format

### Patch Changes

- 88858305: Fixed an issue with the `require` path being incorrect in package.json.
- 218f4521: Use the new GraphQL API clients in shopify-api to use all of the latest features, including automatic types for query / mutation return object and variables.

  For more information and examples, see the [migration guide to v9](../../apps/shopify-api/docs/migrating-to-v9.md#using-the-new-clients).

- Updated dependencies [218f4521]
- Updated dependencies [49952d66]
- Updated dependencies [0286e7fe]
- Updated dependencies [18781092]
- Updated dependencies [2b9e06f6]
- Updated dependencies [194ddcf2]
- Updated dependencies [c9622cd7]
- Updated dependencies [82ee942e]
  - @shopify/graphql-client@0.9.0

## 0.1.0

### Minor Changes

- ca89ef06: Added the ability to automatically type GraphQL queries to the Storefront API when the files created by @shopify/api-codegen-preset are loaded for the app.
- ef053fa5: Added the ability to automatically type GraphQL queries when the files created by @shopify/api-codegen-preset are loaded for the app.

### Patch Changes

- Updated dependencies [ca89ef06]
- Updated dependencies [ef053fa5]
- Updated dependencies [49d5966e]
  - @shopify/graphql-client@0.8.0
