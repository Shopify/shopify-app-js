---
'@shopify/shopify-app-remix': minor
'@shopify/shopify-api': minor
---

# Adds signal as request option

This adds the `signal` option to the `request` method of the GraphQL client, for the shopify-api and shopify-app-remix packages to pass in an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to abort requests, and set a timeout.

If a request is aborted, an `HttpRequestError` will be thrown.

This will allow you to set your own custom timeout, and abort requests.

```ts
// Abort the request after 3 seconds
await admin.graphql('{ shop { name } }', {
  signal: AbortSignal.timeout(3000),
});
```

```ts
// Abort the request after 3 seconds, and retry the request up to 2 times
await admin.graphql('{ shop { name } }', {
  signal: AbortSignal.timeout(3000),
  tries: 2,
});
```