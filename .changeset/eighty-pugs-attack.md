---
'@shopify/shopify-api': minor
---

Support JWT client assertions in the client credentials grant.

`shopify.auth.clientCredentials` now takes an optional `clientAssertion`. When you pass one, the request authenticates with the assertion and the app's client secret is never sent — the body carries only `client_id`, `grant_type`, `client_assertion_type`, and `client_assertion`. Calls that omit it keep using the configured client secret, unchanged.

```ts
const {session} = await shopify.auth.clientCredentials({
  shop,
  clientAssertion: assertion,
});
```

An assertion can only be used once. Create a new assertion for each attempt.

`shopify.auth.clientCredentials` now makes exactly one request and never follows a redirect, for both authentication modes. The request body carries the app's credentials, so following a redirect would hand them to another host. **Compatibility note:** this changes the existing client secret path. A `3xx` response from the access token endpoint, or an opaque redirect in runtimes that filter them, now raises an `HttpResponseError` instead of being followed. The host the request is sent to is unchanged — `domainTransformations` and any other routing configuration still apply as before. If you replace the fetch implementation with `setAbstractFetchFunc`, it must honour `redirect: 'manual'` and must not retry. One that follows a redirect anyway is detected afterwards, through `response.redirected`, and raises an error saying the credentials may already have reached the redirect target.

**Limitation:** this applies to `clientCredentials` only. The library's other calls that post the client secret to `/admin/oauth/access_token` — `auth.callback`, `tokenExchange`, `refreshToken` and `migrateToExpiringToken` — still follow a redirect from that endpoint, so this release does not make "the library never forwards credentials through a redirect" true everywhere.

You can sign the assertion yourself, for example in a KMS, or use the new `shopify.auth.createClientAssertion`:

```ts
const assertion = await shopify.auth.createClientAssertion({
  shop: 'example.myshopify.com',
  kid: 'production-2026-10',
  privateKey,
});
```

The same function is exported from the package root as `createClientAssertion`, for code that holds a key but has no `shopifyApi` object.

It signs one assertion with a `CryptoKey` your app owns and keeps nothing: it stores no key, caches no assertion, and makes no network request. It picks `RS256` or `ES256` from the key — RSASSA-PKCS1-v1_5 with SHA-256 and a modulus of at least 2048 bits, or ECDSA P-256 — and rejects anything else. See [the `createClientAssertion` documentation](./docs/reference/auth/createClientAssertion.md) for the claims it sets.
