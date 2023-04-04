# `shopify.cspHeaders`

This function creates an Express middleware that ensures any response will have the `Content-Security-Policy` header set correctly to prevent clickjacking attacks.

This middleware behaves slightly differently depending on whether your app is embedded or not.

- When embedded, the `Content-Security-Policy` will be set to `frame-ancestors https://admin.shopify.com/ https://[shop].myshopify.com`, where [shop] is dynamically set to the shop domain the app is embedded on.
- When not embedded, the `Content-Security-Policy` will be set to `frame-ancestors none`.

Please visit [our documentation](https://shopify.dev/docs/apps/store/security/iframe-protection) to learn more about setting up iframe protection.

## Example

```ts
const app = express();
const shopifyApp = shopifyApp({
  //...
});

// ...
app.use(shopifyApp.cspHeaders());

// ...
```
