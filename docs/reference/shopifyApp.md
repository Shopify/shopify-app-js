# `shopifyApp`

This function creates an object that contains everything an Express app needs to interact with Shopify.

## Parameters

### api

`ApiConfigParams` | :exclamation: required when not using the Shopify CLI

All values allowed by the `@shopify/shopify-api` package [when calling `shopifyApi`](https://github.com/Shopify/shopify-api-node/blob/shopify_api_next/README.md#configurations).

### useOnlineTokens

`boolean` | Defaults to `false`

Whether the OAuth process should produce online access tokens. Learn more about [access modes in Shopify APIs](https://shopify.dev/apps/auth/oauth/access-modes).

### exitIframePath

`string` | Defaults to `"/exitiframe"`

The path your app's frontend uses to trigger an App Bridge redirect to leave the Shopify Admin before starting OAuth.
Since that page is in the app frontend, we don't include it in this package, but you can find [an example in our template](https://github.com/Shopify/shopify-frontend-template-react/blob/main/pages/ExitIframe.jsx).

### auth

Configurations for OAuth using this package.
See below for the specific details.

#### path

`string` | Defaults to `"/auth"`

The URL path used by the app to start the OAuth process.
This is relative to the root of the `shopify.app` app, so when you mount the shopify app, it'll prepend the mount path.

In the example below, the final auth path is `/shopify/my/auth/path`.

```ts
const shopify = shopifyApp({
  auth: {path: '/my/auth/path'},
});

app.use('/shopify', shopify.app());
```

#### callbackPath

`string` | Defaults to `"/auth/callback"`

The URL path used by the app to complete the OAuth process.
It works in the same way as `path` above.

### webhooks

Configurations for Webhooks using this package.

#### path

`string` | Defaults to `"/webhooks"`

The URL path used by the app to receive HTTP webhooks from Shopify.
This is relative to the root of the `shopify.app` app, so when you mount the shopify app, it'll prepend the mount path.

## Return

Returns an object that contains everything an app needs to interact with Shopify:

### config

`{[key: string]: any}`

The configuration used to set up this object.

### api

The object created by the `@shopify/shopify-api` package. See [the API package documentation](https://github.com/Shopify/shopify-api-node/tree/shopify_api_next#getting-started) for more details.

### [app](./app.md)

`(AppMiddlewareParams) => Express`

A function that returns an Express.js app that contains the necessary endpoints to perform OAuth and webhook processing in the Shopify platform.
You can mount this as a [sub-app](https://expressjs.com/en/api.html#app.mountpath) anywhere in your app.

### [validateAuthenticatedSession](./validateAuthenticatedSession.md)

A function that returns an Express middleware that verifies that the request received is authenticated with a valid session for embedded apps.

### [ensureInstalledOnShop](./ensureInstalledOnShop.md)

A function that returns an Express middleware that verifies that the request received is for a shop that has installed the app when rendering HTML.

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
```
