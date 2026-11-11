# shopify.auth.clientCredentials

Begins the OAuth process by exchanging the [app's client ID and client secret](https://shopify.dev/docs/apps/build/authentication-authorization/client-secrets) for an [access token](https://shopify.dev/docs/apps/auth/access-token-types/online.md) to make authenticated Shopify API requests.

Your app can authenticate with its client secret, or with a JWT client assertion it created itself.

Learn more:

- [Client Credentials Grant](../../guides/oauth.md#client-credentials-grant)

## Examples

### Node.js

```ts
app.get('/auth', async (req, res) => {
  const shop = shopify.utils.sanitizeShop(req.query.shop, true);

  await shopify.auth.clientCredentials({
    shop
  });
});
```

### With a client assertion

```ts
const {session} = await shopify.auth.clientCredentials({
  shop,
  clientAssertion: assertion,
});
```

You can create the assertion with [shopify.auth.createClientAssertion](./createClientAssertion.md), or sign it yourself, for example in a KMS.
To set up the key and see the claims Shopify expects, read [Get application-only access tokens](https://shopify.dev/docs/apps/build/authentication-authorization/application-only-access-tokens).

## Redirects

This call makes exactly one request and never follows a redirect, whichever credential it uses. The request body carries the app's credentials, so following a redirect would hand them to another host. A `3xx` response, or an opaque redirect in runtimes that filter them, raises an [`HttpResponseError`](../../../lib/error.ts) before the response body is read.

On a `3xx` the error's `response.code` is the status the endpoint returned. An opaque redirect carries no status at all, so there `response.code` is `0` and `response.statusText` is empty. Match on the error's message or on `code === 0` if you need to tell the two apart; don't treat `0` as a successful status.

The host is still the one your app's own configuration routes to. `domainTransformations` applies here exactly as it does elsewhere: routing configuration is yours, and the library trusts it rather than second-guessing it. What the library refuses is a redirect the *endpoint* asks for mid-request.

If you replace the fetch implementation with [`setAbstractFetchFunc`](../../../runtime/http/index.ts), it must honour `redirect: 'manual'` and must not retry the request. A custom adapter that follows a redirect sends the credentials to the redirect target before the library can refuse it, so the library also checks the response afterwards: a response reporting `redirected === true` raises an `HttpResponseError` saying the credentials may already be exposed and should be rotated. A fetch implementation that reports nothing about redirects cannot be checked this way.

## Troubleshooting a rejected assertion

A `401 invalid_client` response means the assertion was rejected. The response doesn't say why, so check that:

1. The `kid` names an active key registered for this app.
2. The assertion was signed with that key's private key.
3. The `aud` is `https://{the shop's permanent domain}/admin/oauth/access_token`, which is not necessarily the host your app posted to.
4. The `iss` and `sub` are the `client_id` the request sends.
5. The assertion is new. Each one can only be used once.

A `5xx` response is temporary. Sign a new assertion before you retry.

## Parameters

### shop

`string` | :exclamation: required

A Shopify domain name in the form `{exampleshop}.myshopify.com`.

### clientAssertion

`string` | :bulb: optional

A complete JWT client assertion created by your app.

When you set this, the request authenticates with the assertion and the app's client secret is never sent: the body carries only `client_id`, `grant_type`, `client_assertion_type`, and `client_assertion`. Leave it unset to keep authenticating with the configured client secret. A blank or non-string value is an error rather than a reason to fall back to the secret.

The library treats the value as an opaque string. It does not sign, decode, or validate it.

An assertion can only be used once. If the request fails for any reason, including a [redirect](#redirects), create a new assertion before trying again — the same string will not work twice.

Your app still has to be configured with an `apiSecretKey`, because `shopifyApi` requires one for the rest of the library. It is never sent and never used when you pass an assertion.

The audience your app signs into the assertion stays the shop's canonical token endpoint, so route this request only to hosts you would already send your client secret to.

## Return

`Promise<{session: Session}>`

An object with a `session` property, holding the new Shopify [Session object](../../../lib/session/session.ts) with the API access token.

`session.expires` is set from the `expires_in` the endpoint returned, so read the expiry from the session rather than assuming a fixed lifetime — it differs by app and by how you authenticated. For public apps using a client assertion there is no refresh token, and tokens currently last one hour; request a new token when the one you hold expires.

[Back to shopify.auth](README.md)
