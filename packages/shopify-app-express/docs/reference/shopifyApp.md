# `shopifyApp`

This function creates an object that contains everything an Express app needs to interact with Shopify.

## Parameters

### api

`ApiConfigParams` | :exclamation: required when not using the Shopify CLI

All values allowed by the `@shopify/shopify-api` package [when calling `shopifyApi`](https://github.com/Shopify/shopify-api-js/blob/main/docs/reference/shopifyApi.md).

### auth

Configurations for OAuth using this package.
See below for the specific details.

#### path

`string` | :exclamation: required

The URL path used by the app to start the OAuth process.
This must match the path you use for the `shopify.auth.begin` route.

#### callbackPath

`string` | :exclamation: required

The URL path used by the app to complete the OAuth process.
It works in the same way as `path` above, and it must match the path of the route that uses `shopify.auth.callback`.

### webhooks

Configurations for Webhooks using this package.

#### path

`string` | :exclamation: required

The URL path used by the app to receive HTTP webhooks from Shopify.
This must match the path of the route that uses `shopify.processWebhooks`.

### useOnlineTokens

`boolean` | Defaults to `false`

Whether the OAuth process should produce online access tokens as well as offline ones (created by default).
Learn more about [access modes in Shopify APIs](https://shopify.dev/docs/apps/auth/oauth/access-modes).

### exitIframePath

`string` | Defaults to `"/exitiframe"`

The path your app's frontend uses to trigger an App Bridge redirect to leave the Shopify Admin before starting OAuth.
Since that page is in the app frontend, we don't include it in this package, but you can find [an example in our template](https://github.com/Shopify/shopify-frontend-template-react/blob/main/pages/ExitIframe.jsx).

## Return

Returns an object that contains everything an app needs to interact with Shopify:

### config

`{[key: string]: any}`

The configuration used to set up this object.

### api

The object created by the `@shopify/shopify-api` package. See [the API package documentation](https://github.com/Shopify/shopify-api-js#readme) for more details.

### [auth](./auth.md)

```ts
{begin: () => RequestHandler, callback: () => RequestHandler}
```

An object containing both middlewares you'll need to authenticate with Shopify.

### [processWebhooks](./processWebhooks.md)

`(ProcessWebhooksMiddlewareParams) => RequestHandler`

A function that returns a middleware that processes Shopify webhook requests.
This _must_ be a `post` route.

### [validateAuthenticatedSession](./validateAuthenticatedSession.md)

`() => RequestHandler`

A function that returns an Express middleware that verifies that the request received is authenticated with a valid session for embedded apps.

### [ensureInstalledOnShop](./ensureInstalledOnShop.md)

`() => RequestHandler`

A function that returns an Express middleware that verifies that the request received is for a shop that has installed the app when rendering HTML.

### [redirectToShopifyOrAppRoot](./redirectToShopifyOrAppRoot.md)

`() => RequestHandler`

A function that returns an Express middleware that redirects the user to the app, embedding it into Shopify depending on `api.isEmbeddedApp`.

## Example

```ts
const shopify = shopifyApp({
  api: {
    apiKey: 'ApiKeyFromPartnersDashboard',
    apiSecretKey: 'ApiSecretKeyFromPartnersDashboard',
    scopes: ['your_scopes'],
    hostScheme: 'http',
    hostName: `localhost:${PORT}`,
    billing: {
      'My plan': {
        amount: 10,
        currencyCode: 'USD',
        interval: BillingInterval.Every30Days,
      },
    },
  },
  auth: {
    path: '/auth',
    callbackPath: '/auth/callback',
  },
  webhooks: {
    path: '/webhooks',
  },
});

// The paths to these routes must match the configured values above
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({webhookHandlers}),
);
```
