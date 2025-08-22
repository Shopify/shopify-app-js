# @shopify/graphql-client

## 1.4.1

### Patch Changes

- 056f464: Fix error handling for JSON parse failures in GraphQL responses.

  When a server returns non-JSON content (e.g., HTML error pages, malformed JSON), the client now properly handles the parsing error and includes the response object and status code in the error details. This prevents uncaught promise rejections and provides better debugging information.

- 447348f: Resolve bug with signal option on requests
- e298a0c: Fix issue with missing sourcemaps

## 1.4.0

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

## 1.3.2

### Patch Changes

- 981c948: Update directory path

## 1.3.1

### Patch Changes

- 4adbc2b: # Generate Provenance Statements

  This changes no functionality.

  The provenance attestation is established by publicly providing a link to a package's source code and build instructions from the build environment. This allows developers to verify where and how your package was built before they download it.

  Learn more about [npm provenance](https://docs.npmjs.com/generating-provenance-statements#about-npm-provenance)

## 1.3.0

### Minor Changes

- 4603b69: Make fetch's keepalive configurable when making requests

  Example:

  ```typescript
  const shopQuery = `
    query ShopQuery {
      shop {
        name
        id
      }
    }
  `;

  const {data, errors, extensions} = await client.request(shopQuery, {
    keepalive: true,
  });
  ```

## 1.2.2

### Patch Changes

- d3531c5: Better error handling for missing Response.body in multipart requests. Instead of being "Cannot read properties of undefined (reading 'Symbol(Symbol.asyncIterator)')", it will now be the more useful and accurate message "API multipart response did not return an iterable body".

## 1.2.1

### Patch Changes

- f38dfc0: Improved error messages when validating store domain urls

## 1.2.0

### Minor Changes

- ada2cc3: Adds support for `signal` request option

## 1.1.0

### Minor Changes

- 1aa226b: Return headers in responses from GraphQL client.

  Headers are now returned in the response object from the GraphQL client.

  In apps using the `@shopify/shopify-app-remix` package the headers can be access as follows:

  ```ts
    const response = await admin.graphql(
      ...

    const responseJson = await response.json();
    const responseHeaders = responseJson.headers
    const xRequestID = responseHeaders? responseHeaders["X-Request-Id"] : '';
    console.log(responseHeaders);
    console.log(xRequestID, 'x-request-id');
  ```

### Patch Changes

- 5bf588d: Rename internal `fetch` parameters to avoid errors on external builds.

## 1.0.0

### Major Changes

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.

### Minor Changes

- 36e3c62: Add support for Node 22.

## 0.10.4

### Patch Changes

- 715a120: Fixed the minified build process to not mangle the `fetch` function, which led to requests failing in the final package.

## 0.10.3

### Patch Changes

- e9652b7: Remove `Partial` around the `ClientStreamResponse.data` type

## 0.10.2

### Patch Changes

- 2f862e3: Update `requestStream()` to always process response iterator chunks as `Uint8Array` values
- b2f29ae: Add default SDK headers to all API requests when none are provided

## 0.10.1

### Patch Changes

- 56d2fcd: Update `requestStream()` to support `Uint8Array` streamed encoded format in `node` environments

## 0.10.0

### Minor Changes

- 9df4bacf: Add new `requestStream()` function to support streamed responses from Storefront API

## 0.9.4

### Patch Changes

- 295859d6: Fix GraphQL client validations for store hosts starting with http

## 0.9.3

### Patch Changes

- 0f0ffb8a: Updated global fetch types to more closely match reality

## 0.9.2

### Patch Changes

- b2414c2f: Remove `Partial` around the `ClientResponse.data` type for easier consumption of the client's returned typed data

## 0.9.1

### Patch Changes

- a23cd941: Rename `fetchApi` parameter to `customFetchApi` for clarity

## 0.9.0

### Minor Changes

- 0286e7fe: Export a REST API client from `admin-api-client`, with an API that is similar to the GraphQL client.
- 18781092: Updated shopify-api GraphQL clients' APIs to be closer to the underlying clients
- 2b9e06f6: Add the raw network response object to `ResponseErrors`
- 194ddcf2: Update api version validation error, generic error messages and client types
- c9622cd7: Update `UNSUPPORTED_API_VERSION` log type to `Unsupported_Api_Version` for consistent log type format

### Patch Changes

- 218f4521: Use the new GraphQL API clients in shopify-api to use all of the latest features, including automatic types for query / mutation return object and variables.

  For more information and examples, see the [migration guide to v9](../../apps/shopify-api/docs/migrating-to-v9.md#using-the-new-clients).

- 49952d66: Fix `ResponseWithType` to correctly type the `json` return value
- 82ee942e: Update `ResponseWithType` type to extend from the `Response` type

## 0.8.0

### Minor Changes

- ca89ef06: Added the ability to automatically type GraphQL queries to the Storefront API when the files created by @shopify/api-codegen-preset are loaded for the app.
- ef053fa5: Added the ability to automatically type GraphQL queries when the files created by @shopify/api-codegen-preset are loaded for the app.
- 49d5966e: Rename `customHeaders` to `headers` in Api Client utils and types for readibility

## 0.7.0

### Minor Changes

- b830e575: Add API client utility factories for generating the `getHeaders()` and `getGQLClientParams()` functions

## 0.6.0

### Minor Changes

- afe74c1d: Updated types, functions and parameter names to consistently use `Api` and renamed the `ResponseErrors.error` field to `ResponseErrors.errors`. Also updated the client's `request()` to return both the `errors` and `data` if the API response returns partial data and error info.

## 0.5.1

### Patch Changes

- e28c2663: Fixed "validateDomainAndGetStoreUrl()" to always return a secure (i.e. "https") store URL

## 0.5.0

### Minor Changes

- 326520ce: Consolidated and standardized the common API client domain and validation utility functions.

## 0.4.0

### Minor Changes

- a491295a: Add common API client specific utilities and types to the package.

## 0.3.0

### Minor Changes

- bb634937: Added a new `logging` functionality to the client. This feature enables client consumers to log `request/response` and `retry attempt` info if a logger function is provided at initialization. Also, the `retry` error messages were updated for clarity.

## 0.2.0

### Minor Changes

- efc66ead: Added a new `retries` feature to the `graphql-client`. This feature allows client consumers to set the number of HTTP request retries when the API request is abandoned or the API server returns a `429` or `503` response.
- 77be46bb: Added a new `graphql-client` package. This client is a generic GQL client that provides basic functionalities to interact with Shopify's GraphQL APIs.
