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

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-session-storage/implementing-session-storage.md).
