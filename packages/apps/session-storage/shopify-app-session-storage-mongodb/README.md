# Session Storage Adapter for MongoDB

This package implements the `SessionStorage` interface that works with an instance of [MongoDB](https://www.mongodb.com/home).

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {MongoDBSessionStorage} from '@shopify/shopify-app-session-storage-mongodb';

const shopify = shopifyApp({
  sessionStorage: new MongoDBSessionStorage(
    'mongodb://username:password@host/',
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

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
