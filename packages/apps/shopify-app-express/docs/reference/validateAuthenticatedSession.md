# `shopify.validateAuthenticatedSession`

This function creates an Express middleware that ensures any request to that endpoint will have a valid session (i.e., not expired, access token available, scopes match).

This middleware behaves slightly differently depending on whether your app is embedded or not.
If the verification fails in either case, it will redirect the user to complete OAuth, thereby ensuring that a valid session is available to continue processing.

- When embedded, it will verify that the request received from the front-end originates from an logged in user, and that [App Bridge](https://shopify.dev/docs/api/app-bridge-library/apis/resource-fetching) has added the appropriate authentication headers.
- When not embedded, it will verify that the request contains a valid session cookie set up during the OAuth process.
  - XHR requests will return a `403 Forbidden` response with the `X-Shopify-Api-Request-Failure-Reauthorize-Url` header indicating where to redirect the user for authentication.

Please visit [our documentation](https://shopify.dev/docs/apps/auth/oauth/session-tokens) to learn more about session tokens and how they work.

## Example

```ts
const app = express();

app.get(
  '/api/product/count',
  shopify.validateAuthenticatedSession(),
  async (res, req) => {
    // because of shopify.validateAuthenticatedSession(), session is available
    // in res.locals.shopify.session
    const session = res.locals.shopify.session;

    // Interact with the API
  },
);
```
