# `shopify.authenticatedRequest()`

This function creates an Express middleware that ensures any request to that endpoint will have a valid session (i.e., not expired, access token available, scopes match).

If the request received from the front-end does not originate from an App Bridge `authenticatedFetch`, it will redirect to complete OAuth, thereby ensuring that a valid session is available to continue processing.

## Example

```ts
const app = express();

app.use('/api', shopify.authenticatedRequest());
```
