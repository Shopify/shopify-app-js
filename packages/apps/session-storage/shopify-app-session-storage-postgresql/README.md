# Session Storage Adapter for PostgreSQL

This package implements the `SessionStorage` interface that works with an instance of [PostgreSQL](https://www.postgresql.org).
Tested using PostgreSQL v15

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {PostgreSQLSessionStorage} from '@shopify/shopify-app-session-storage-postgresql';

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
  ),
  // ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    new URL('postgres://username:password@host/database'),
  ),
  // ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: PostgreSQLSessionStorage.withCredentials(
    'host.com',
    'thedatabase',
    'username',
    'password',
  ),
  // ...
});
```

## Connecting over TLS

The adapter connects with the TLS settings of the database URL (`sslmode`, `ssl`, `sslrootcert`, `sslcert` and `sslkey`), which it reads as [`pg`](https://node-postgres.com/features/ssl) does. A URL without them connects without TLS, unless the `PGSSLMODE` environment variable is set.

In production, require TLS and check the server's certificate:

```js
const sessionStorage = new PostgreSQLSessionStorage(
  'postgres://username:password@host/database?sslmode=verify-full',
);
```

`sslmode=verify-full` checks the certificate against the system's trusted CAs and checks the host name. `pg` 8 treats `sslmode=require` and `sslmode=verify-ca` the same way, and prints a warning. If your provider signs the certificate with its own CA, name the CA file with `sslrootcert`, or pass the `ssl` option, which `pg` takes as is. The `ssl` option replaces the TLS settings of the URL:

```js
const sessionStorage = new PostgreSQLSessionStorage(
  'postgres://username:password@host/database',
  {ssl: {ca: process.env.DATABASE_CA_CERT}},
);

// OR

const sessionStorage = PostgreSQLSessionStorage.withCredentials(
  'host.com',
  'thedatabase',
  'username',
  'password',
  {ssl: {ca: process.env.DATABASE_CA_CERT}},
);
```

Do not use `rejectUnauthorized: false` or `sslmode=no-verify` in production: they encrypt the connection but accept any server. Connect the adapter only to a database server you trust, because `pg` parses every message that the server sends.

## Expiring Offline Access Tokens

This storage adapter supports [expiring offline access tokens](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/offline-access-tokens#step-7-get-a-new-access-token-exchange). When enabled, the adapter automatically stores and retrieves refresh tokens alongside your session data.

To enable this feature, set the `expiringOfflineAccessTokens` future flag in your app configuration:

```typescript
const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
  ),
  future: {
    expiringOfflineAccessTokens: true,
  },
  // ... other config
});
```

The required database columns (`refreshToken` and `refreshTokenExpires`) are added automatically via the built-in migration system. For details, see the [migration guide](./MIGRATION_TO_EXPIRING_TOKENS.md).

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
