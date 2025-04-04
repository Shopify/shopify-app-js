---
'@shopify/admin-api-client': minor
'@shopify/graphql-client': minor
'@shopify/shopify-api': minor
---

# Add Logging for Shopify GraphQL Admin API Deprecated Reason

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
