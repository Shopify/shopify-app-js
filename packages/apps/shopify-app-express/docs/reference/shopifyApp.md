# `shopifyApp`

This function creates an object that contains everything an Express app needs to interact with Shopify.

## Parameters

### api

`ApiConfigParams` | :exclamation: required when not using the Shopify CLI

All values allowed by the `@shopify/shopify-api` package [when calling `shopifyApi`](../../../shopify-api/docs/reference/shopifyApi.md).

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

The URL path used by the app to receive HTTP webhook deliveries from Shopify.
This path is required regardless of whether you use [app-specific or shop-specific](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions) subscriptions — both deliver payloads to this endpoint.
This must match the path of the route that uses `shopify.processWebhooks`.

### useOnlineTokens

`boolean` | Defaults to `false`

Whether the OAuth process should produce online access tokens as well as offline ones (created by default).
Learn more about [access modes in Shopify APIs](https://shopify.dev/docs/apps/auth/oauth/access-modes).

### exitIframePath

`string` | Defaults to `"/exitiframe"`

The path your app's frontend uses to trigger an App Bridge redirect to leave the Shopify Admin before starting OAuth.
Since that page is in the app frontend, we don't include it in this package, but you can find [an example in our template](https://github.com/Shopify/shopify-frontend-template-react/blob/main/pages/ExitIframe.jsx).

### future

`{[flag: string]: boolean}` | Defaults to `{}`

Opt in to upcoming features before they become the default.

#### expiring offline access tokens

`future: {expiringOfflineAccessTokens: true}` | Defaults to `false`

When enabled, the app requests an expiring offline access token during OAuth and automatically refreshes it (using the stored refresh token) when it is expired or within 5 minutes of expiring. `validateAuthenticatedSession` refreshes the token before use, and `shopify.ensureValidOfflineSession(shop)` can be used from background work (webhooks, cron jobs, queues) to load an offline session with a valid token.

Your session storage must persist the `refreshToken` and `refreshTokenExpires` fields for this to work.

#### token exchange

`future: {unstable_tokenExchange: true}` | Defaults to `false`

When enabled, embedded apps fetch access tokens via [token exchange](./guides/token-exchange.md) instead of the OAuth redirect flow, which removes the redirect flicker on load. Requires an embedded app (`isEmbeddedApp`) using [Shopify managed installation](https://shopify.dev/docs/apps/auth/installation). Non-embedded apps, and apps with the flag off, continue to use the OAuth code flow.

When token exchange is active, the OAuth routes (`auth.begin` / `auth.callback`) are not used and will return an error if called. Because there is no OAuth callback to register webhooks, use [`registerWebhooks`](#registerwebhooks) (typically from the `afterAuth` hook).

### hooks

`{afterAuth?: (options: {session: Session}) => void | Promise<void>}`

Callbacks that run at points in the authentication lifecycle.

#### afterAuth

Runs after authentication completes (both token exchange and the OAuth callback), with the resulting session. A common use is registering webhooks:

```ts
hooks: {
  afterAuth: async ({session}) => {
    await shopify.registerWebhooks({session});
  },
},
```

## Return

Returns an object that contains everything an app needs to interact with Shopify:

### config

`{[key: string]: any}`

The configuration used to set up this object.

### api

The object created by the `@shopify/shopify-api` package. See [the API package documentation](../../../shopify-api#readme) for more details.

### [auth](./auth.md)

```ts
{begin: () => RequestHandler, callback: () => RequestHandler}
```

An object containing both middlewares you'll need to authenticate with Shopify.

### [processWebhooks](./processWebhooks.md)

`(ProcessWebhooksMiddlewareParams) => RequestHandler`

A function that returns a middleware that processes Shopify webhook requests. The `webhookHandlers` parameter defines [shop-specific subscriptions](https://shopify.dev/docs/apps/build/webhooks/subscribe#shop-specific-subscriptions).
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

### [redirectOutOfApp](./redirectOutOfApp.md)

`(RedirectOutOfAppParams) => void`

A function that redirects to any URL at the browser's top level, regardless of where the request originated from.

### ensureValidOfflineSession

`(shop: string) => Promise<Session | undefined>`

Loads the offline session for a shop and, when the `expiringOfflineAccessTokens` future flag is enabled, refreshes its access token if it is expired or close to expiring. Returns `undefined` when no offline session is stored. Use this from background work (webhooks, cron jobs, queues) that needs a valid offline token. Callers should trigger re-authentication if the refresh token has been revoked.

### registerWebhooks

`(params: {session: Session}) => Promise<void>`

Registers the app's webhook subscriptions for a shop. When using token exchange there is no OAuth callback to register webhooks, so call this yourself, usually from the `afterAuth` hook.

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
// webhookHandlers defines shop-specific subscriptions.
// For most apps, prefer app-specific subscriptions in shopify.app.toml.
// https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-vs-shop-specific-subscriptions
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({webhookHandlers}),
);
```
