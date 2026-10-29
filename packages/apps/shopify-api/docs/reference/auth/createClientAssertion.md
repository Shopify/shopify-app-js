# shopify.auth.createClientAssertion

Creates a signed JWT client assertion for the [client credentials grant](./clientcredentials.md), using a private key your app owns.

Your app owns the key. This function signs one assertion with it and keeps nothing: it stores no key, caches no assertion, makes no network request, and does not generate, import, rotate, or register keys. If your key lives in a KMS or HSM, sign the assertion there instead and pass the result straight to [`shopify.auth.clientCredentials`](./clientcredentials.md) — this function is not required.

To generate a key pair and register its public key with your app, see [Get application-only access tokens](https://shopify.dev/docs/apps/build/authentication-authorization/application-only-access-tokens).

`shopifyApi` still requires an `apiSecretKey`, because the rest of the library uses it. It is never sent and never used on the assertion path.

## Example

```ts
const assertion = await shopify.auth.createClientAssertion({
  shop: 'example.myshopify.com',
  kid: 'production-2026-10',
  privateKey,
});

const {session} = await shopify.auth.clientCredentials({
  shop: 'example.myshopify.com',
  clientAssertion: assertion,
});
```

`privateKey` is a `CryptoKey` your app imported itself, for example with `crypto.subtle.importKey`. Importing it as non-extractable keeps your own code from exporting it. It is not a guarantee that the bytes cannot be read at all: on Node, `jose` converts the handle with `KeyObject.from()`, and `.export()` works on the result — which is how the library's own tests sign with `extractable: false` keys.

> [!NOTE]
> It has to be a `CryptoKey`. A Node `KeyObject` is not accepted, so only use import functions that return a `CryptoKey`: `jose`'s `importPKCS8` and `importJWK` return a `KeyObject` on Node in v5, and a `CryptoKey` from v6 onwards.

### Signing without a configured object

The same function is exported from the package root, for code that holds a key but has no `shopifyApi` object — a signing service, for example. It reads no configuration, so every value is explicit:

```ts
import {createClientAssertion} from '@shopify/shopify-api';

const assertion = await createClientAssertion({
  shop: 'example.myshopify.com',
  clientId,
  kid: 'production-2026-10',
  privateKey,
});
```

## Parameters

### shop

`string` | :exclamation: required

The shop's permanent domain, in the form `{exampleshop}.myshopify.com`. The assertion's `aud` claim is `https://{shop}/admin/oauth/access_token`.

This accepts the same shop domains as the rest of the library, so development domains work too, as do the domains either side of a configured `domainTransformations` rule and `admin.shopify.com/store/...` URLs, which are converted to the shop's permanent domain. The host is lower-cased and a trailing slash is dropped. A custom storefront domain is not a permanent domain, and is rejected.

The audience never follows a `domainTransformations` rule, even though the token request does. The claim describes the shop the assertion is for; the transformation decides which host your app posts it to.

The root `createClientAssertion` function has no configuration to read, so it accepts `.myshopify.com` domains only.

### clientId

`string` | :bulb: optional, defaults to the configured `apiKey`

Your app's client ID, used as both the `iss` and `sub` claims. It must match the app the key is registered to, and the `client_id` the token request sends — which is the configured `apiKey`, so leaving this out is the way to keep the two in step.

The root `createClientAssertion` function reads no configuration, so there it is required.

### kid

`string` | :exclamation: required

The identifier you registered for this key, used as the `kid` header. This function does not derive or compute it, and cannot check that the key is still registered — Shopify checks that when the assertion is exchanged.

### privateKey

`CryptoKey` | :exclamation: required

The private signing key. Two kinds of key are accepted, and the algorithm is chosen from the key rather than from an option:

| Key                                                      | Algorithm |
| -------------------------------------------------------- | --------- |
| RSASSA-PKCS1-v1_5, SHA-256, modulus of 2048 bits or more | `RS256`   |
| ECDSA, P-256                                             | `ES256`   |

Anything else is rejected, including public keys, keys without the `sign` usage, RSA keys below 2048 bits, RSA-PSS keys, other curves, and HMAC secrets.

### lifetimeSeconds

`number` | :bulb: optional, defaults to `60`

How long the assertion is valid for. Must be an integer between 1 and 300. Values outside that range are rejected rather than clamped.

Keep the signing host's clock synchronized. Shopify checks `iat` and `exp` against its own clock, so a host whose clock is off can sign assertions that are rejected with `401 invalid_client`. If the host's clock may drift, raise this toward 300.

## Return

`Promise<string>`

The signed assertion, ready to pass as `clientAssertion`.

Each call creates a new `jti`, and an assertion can only be used once. If a token request fails and you want to try again, call this function again instead of reusing the string.

A rejected assertion always arrives as `401 invalid_client`, whatever the cause. See [troubleshooting a rejected assertion](./clientcredentials.md#troubleshooting-a-rejected-assertion) for the five things it can mean.

## Errors

All of these extend `ShopifyError`, and none of them include the key or any part of it in the message:

| Error                         | Cause                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `InvalidClientAssertionError` | The key cannot sign this assertion, or `lifetimeSeconds` is out of range.         |
| `InvalidShopError`            | `shop` is not a permanent shop domain.                                            |
| `MissingRequiredArgument`     | `clientId` or `kid` is missing or blank.                                          |

## Claims

Your app supplies the identity and the key; this function supplies the rest of the profile:

```text
header:
  alg = RS256 or ES256, selected from the key
  typ = JWT
  kid = your registered identifier

claims:
  iss = clientId
  sub = clientId
  aud = https://{shop}/admin/oauth/access_token
  iat = current time, as integer seconds
  exp = iat + lifetimeSeconds
  jti = a new random identifier, for this call only
```

There is no option to override the algorithm, add headers, or set claims directly. If you need a different arrangement, sign the assertion in your own code and pass the result to [`shopify.auth.clientCredentials`](./clientcredentials.md).

[Back to shopify.auth](README.md)
