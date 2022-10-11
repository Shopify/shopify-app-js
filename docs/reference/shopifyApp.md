# `shopifyApp`

This function creates an object that contains everything an Express app needs to interact with Shopify.

It will redirect to the app within Shopify when OAuth completes, unless the `afterAuth` callback triggers a different redirect.

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
    checkBillingPlans: ['My plan'],
    afterAuth: async ({req, res, session, hasPayment, api}) => {
      // App-specific behaviour goes here
    },
  },
});
```

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

### auth

Configurations for OAuth using this package.
See below for the specific details.

#### path

`string` | Defaults to `"/auth"`

The path used by the app to start the OAuth process.

#### callbackPath

`string` | Defaults to `"/auth/callback"`

The path used by the app to complete the OAuth process.

#### checkBillingPlans

`string[]`

Check if any of these plans are active for the shop after OAuth completes.

#### afterAuth

`Function`

Callback called after OAuth completes to enable custom app behaviour. Receives an object with the following parameters:

- `req`: `express.Request`
- `res`: `express.Response`
- `session`: `Session`
- `hasPayment`: `boolean`
- `api`: the `shopify.api` object used for the OAuth requests.

For example, the following callback will request payment after OAuth if the merchant hasn't paid for the app yet.

```ts
const shopify = shopifyApp({
  auth: {
    afterAuth: async ({req, res, session, hasPayment, api}) => {
      if (!hasPayment) {
        res.redirect(
          await api.billing.request({
            session,
            plan: 'My plan',
            isTest: true,
          }),
        );
      }
    },
  },
});
```

> **Note**: the above example doesn't have to trigger a redirect back to the app if payment exists - the package will do that by default.

## Return

Returns an object that contains everything an app needs to interact with Shopify:

### config

`{[key: string]: any}`

The configuration used to set up this object.

### api

The object created by the `@shopify/shopify-api` package. See [the package documentation](https://github.com/Shopify/shopify-api-node/tree/shopify_api_next#getting-started) for more details.

### auth

`Express`

An Express.js app that contains the necessary endpoints to perform OAuth in the Shopify platform.
You can mount this as a sub-app anywhere in your app.
