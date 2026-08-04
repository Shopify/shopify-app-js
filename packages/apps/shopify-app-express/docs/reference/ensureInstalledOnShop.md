# `shopify.ensureInstalledOnShop`

This function creates an Express middleware that ensures any request to that endpoint belongs to a shop that has already installed the app. You should call this middleware in any endpoint that renders HTML, if your app is embedded.

You don't need to use it if your app is not embedded, because you can use `validateAuthenticatedSession` on any non-embedded request.
If you call this middleware on a non-embedded app, it will behave like `validateAuthenticatedSession` instead.

When the [`unstable_tokenExchange`](./guides/token-exchange.md) future flag is enabled, this middleware does not check session storage to decide whether the app is installed (under managed installation a shop may have no stored session until its first token exchange). It embeds the app if needed and loads it; the first authenticated request then mints the session via token exchange.

## Example

```ts
const app = express();

// If the app wasn't installed in the shop, Shopify will prompt the merchant for permissions.
app.use('/', shopify.ensureInstalledOnShop(), (req, res) => {
  res.send('Hello world!');
});
```
