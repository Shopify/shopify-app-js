# `shopify.authenticatedRequest`

This function creates an Express middleware that ensures any request to that endpoint will have a valid session (i.e., not expired, access token available, scopes match). You don't need to use this middleware if your app is not embedded.

If the request received from the front-end does not originate from an App Bridge `authenticatedFetch`, it will redirect to complete OAuth, thereby ensuring that a valid session is available to continue processing.

Please visit [our documentation](https://shopify.dev/apps/auth/oauth/session-tokens) to learn more about session tokens and how they work.

## Example

```ts
const app = express();

app.get(
  '/api/product/count',
  shopify.authenticatedRequest(),
  async (res, req) => {
    // because of shopify.authenticateRequest(), session is available
    // in res.locals.shopify.session
    const session = res.locals.shopify.session;

    // Interact with the API
  },
);
```
