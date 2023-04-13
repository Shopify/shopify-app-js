# `shopify.redirectOutOfApp()`

This function enables apps to redirect out of the app's host, regardless of how a request reached the app.
It covers the following scenarios:

- If the request came from an `authenticatedFetch` call, it'll return the right headers for App Bridge.
- If the request came from an app embedded in the Shopify Admin, it'll use `config.exitIframePath`.
- Otherwise, it will trigger a normal HTTP redirect.

## Parameters

This function takes in an object with the following properties:

### `req`

`express.Request`

The Express.js request object.

### `res`

`express.Response`

The Express.js response object.

### `redirectUri`

`string`

The URI to redirect to.

### `shop`

`string`

The shop for this request.

## Example

The following example shows how to setup handlers for the mandatory GDPR webhooks.

```ts
const shopify = shopifyApp({});

const redirectMiddleware = (req, res, next) => {
  if (redirectRequired) {
    shopify.redirectOutOfApp({
      req,
      res,
      redirectUri: '/my-non-embedded-endpoint',
      shop: shopify.api.utils.sanitizeShop(req.query.shop),
    });
  } else {
    next();
  }
};

app.get(
  '/api/endpoint-that-redirects',
  shopify.validateAuthenticatedSession(),
  // redirectOutOfApp will cause App Bridge to trigger the redirect
  redirectMiddleware,
  (req, res) => {
    // Handle request as usual
  },
);

app.get(
  '/html-endpoint',
  shopify.ensureInstalledOnShop(),
  // redirectOutOfApp will cause the app to break out of the iframe
  redirectMiddleware,
  (req, res) => {
    // Handle request as usual
  },
);
```
