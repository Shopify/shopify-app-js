# `shopify.ensureInstalled`

This function creates an Express middleware that ensures any request to that endpoint belongs to a shop that has already installed the app.

You should call this middleware in any endpoint that renders HTML, regardless of whether your app is embedded or not.

## Example

```ts
const app = express();

// If the app wasn't installed in the shop, Shopify will prompt the merchant for permissions.
app.use('/', shopify.ensureInstalled(), (req, res) => {
  res.send('Hello world!');
});
```
