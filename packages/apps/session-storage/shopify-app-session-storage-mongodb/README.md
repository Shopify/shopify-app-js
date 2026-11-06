# Session Storage Adapter for MongoDB

This package implements the `SessionStorage` interface that works with an instance of [MongoDB](https://www.mongodb.com/home).

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {MongoDBSessionStorage} from '@shopify/shopify-app-session-storage-mongodb';

const shopify = shopifyApp({
  sessionStorage: new MongoDBSessionStorage(
    'mongodb+srv://username:password@host/',
    'database',
  ),
  // ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: MongoDBSessionStorage.withCredentials(
    'host.com',
    'thedatabase',
    'username',
    'password',
  ),
  // ...
});
```

## TLS and trusted servers

Connect only to a MongoDB server that you run or trust. A malicious server, or an attacker on an unencrypted connection to the server, can send responses that stop your app.

When `NODE_ENV` is `production`, `MongoDBSessionStorage` refuses to connect without TLS that verifies the server's certificate and host name:

- Use a `mongodb+srv://` URL, which turns on TLS, or add `tls=true` to a `mongodb://` URL. `withCredentials` adds `tls=true` to the URL it builds.
- Do not set `tlsInsecure`, `tlsAllowInvalidCertificates` or `tlsAllowInvalidHostnames` in the URL.

Outside production, for example against a local MongoDB server during development, the session storage connects without TLS.

If your production server is on a network you trust and cannot use TLS, set `allowInsecureConnection`:

```js
const sessionStorage = new MongoDBSessionStorage(
  'mongodb://username:password@host/',
  'database',
  {allowInsecureConnection: true},
);
```

## Refresh Token Support

This package supports storing refresh tokens for apps using expiring offline access tokens. No migration or schema changes are required. MongoDB's flexible schema automatically accommodates the additional fields.

To enable expiring offline access tokens in your app:

```js
const shopify = shopifyApp({
  sessionStorage: new MongoDBSessionStorage(
    'mongodb+srv://username:password@host/',
    'database',
  ),
  future: {
    expiringOfflineAccessTokens: true,
  },
  // ...
});
```

If you prefer to use your own implementation of a session storage mechanism that uses the `SessionStorage` interface, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
