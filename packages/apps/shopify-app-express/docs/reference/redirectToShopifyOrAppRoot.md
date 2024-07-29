# `shopify.redirectToShopifyOrAppRoot`

This function creates an Express middleware that loads the app's root, and ensures that it loads in the appropriate location.

For instance, if this is an embedded app, it will redirect to the Shopify Admin and embed the app within it, but if the app is not embedded, it will load it at the browser's top level.

> **Note**: This middleware expects a session to be available in `res.locals.shopify.session`.

## Example

```ts
const app = express();

// Once OAuth completes, return to the app root in the appropriate location.
app.get(
  '/auth/callback',
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);
```
