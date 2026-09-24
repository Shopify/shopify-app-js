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

## Connecting via Unix Socket (e.g. Google Cloud SQL)

When deploying on Google Cloud (Cloud Run, App Engine, GKE), the Cloud SQL Auth Proxy provides database connections through Unix sockets. You can connect by specifying the socket path via the `host` query parameter:

```js
const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@/database?host=/cloudsql/my-project:us-central1:my-instance',
  ),
  // ...
});
```

This also works for any other environment where PostgreSQL is accessed via a Unix domain socket.

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
