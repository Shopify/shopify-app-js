# shopify.auth.refreshToken

Refreshes an access token for a given session using a refresh token. This is used to obtain a new access token when the current one has expired (or is about to expire).

## Examples

### Node.js

```ts
const response = await shopify.auth.refreshToken({
  shop: 'my-shop.myshopify.com',
  refreshToken: 'refresh-token-from-session',
});

const {session} = response;
// Use the new session with updated access token and (potentially) new refresh token
```

## Parameters

### shop

`string` | :exclamation: required

A Shopify domain name in the form `{exampleshop}.myshopify.com`.

### refreshToken

`string` | :exclamation: required

The refresh token stored in the session.

## Return

`Promise<{session: Session}>`

Returns a promise resolving to an object containing the new [`Session`](../../../lib/session/session.ts) with the refreshed access token.

[Back to shopify.auth](./README.md)


