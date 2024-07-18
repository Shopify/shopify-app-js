---
'@shopify/graphql-client': minor
'@shopify/shopify-app-remix': minor
'@shopify/shopify-api': minor
---

Return headers in responses from GraphQL client.

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
