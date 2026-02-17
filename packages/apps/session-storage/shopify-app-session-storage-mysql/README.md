# Session Storage Adapter for MySQL DB

This package implements the `SessionStorage` interface that works with an instance of [MySQL](https://www.mysql.com), using the `mysql.Pool` as the underlying connection resource.

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {MySQLSessionStorage} from '@shopify/shopify-app-session-storage-mysql';

const shopify = shopifyApp({
  sessionStorage: new MySQLSessionStorage(
    'mysql://username:password@host/database',
    {connectionPoolLimit: 10}, // optional
  ),
  // ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: new MySQLSessionStorage(
    new URL('mysql://username:password@host/database'),
    {connectionPoolLimit: 10}, // optional
  ),
  // ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: MySQLSessionStorage.withCredentials(
    'host.com',
    'thedatabase',
    'username',
    'password',
    {connectionPoolLimit: 10}, // optional
  ),
  // ...
});
```

## Scalability

This package supports the storage of refresh tokens and refresh token expiration dates, which enables apps to use [expiring offline access tokens](https://shopify.dev/docs/apps/auth/access-token-types/offline-access-tokens#expiring-offline-access-tokens). The required database columns are added automatically via a migration that runs on the first connection after upgrading.

To enable this feature, set the `future.expiringOfflineAccessTokens` flag in your app configuration:

```typescript
future: {
  expiringOfflineAccessTokens: true,
}
```

For detailed migration instructions, see [MIGRATION_TO_EXPIRING_TOKENS.md](./MIGRATION_TO_EXPIRING_TOKENS.md).

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
