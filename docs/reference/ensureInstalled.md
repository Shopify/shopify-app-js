# `shopify.ensureInstalled`

This function creates an Express middleware that ensures any request to that endpoint belongs to a shop that has already installed the app. You should call this middleware in any endpoint that renders HTML, if your app is embedded.

You don't need to use it if your app is not embedded, because you can use `validateSession` on any non-embedded request.
If you call this middleware on a non-embedded app, it will behave like `validateSession` instead.

## Example

```ts
const app = express();

// If the app wasn't installed in the shop, Shopify will prompt the merchant for permissions.
app.use('/', shopify.ensureInstalled(), (req, res) => {
  res.send('Hello world!');
});
```
