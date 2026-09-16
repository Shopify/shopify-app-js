# shopify.auth.globalApiClientCredentials

Mints an app-level Global API token with the `apiKey` and `apiSecretKey` in the Shopify API configuration. This flow does not use a shop session.

The SDK caches the token until shortly before its expiry. Use `forceRefresh` only when Shopify rejects a cached token or when you need a new token immediately.

## Examples

### Node.js

```ts
const {token} = await shopify.auth.globalApiClientCredentials();

console.log(token.expiresAt);
console.log(token.scopes);
```

## Parameters

### forceRefresh

`boolean`

Mints a new token even when a valid token is cached. Defaults to `false`.

## Return

`Promise<{token: GlobalApiToken}>`

The token contains:

- `accessToken`: the bearer token for Global API requests.
- `expiresAt`: the token expiry as a `Date`.
- `scopes`: the token's granted scopes.

[Back to shopify.auth](README.md)
