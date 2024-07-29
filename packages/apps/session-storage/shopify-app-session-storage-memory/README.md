# In-Memory Session Storage

This package implements the `SessionStorage` interface to work with an in-memory storage table.

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

const shopify = shopifyApp({
  sessionStorage: new MemorySessionStorage(),
  // ...
});
```

> **Note**: :warning: This session storage model is for local development only, to make it easier for developers to get started.
> It will delete all sessions if the app process gets restarted or redeployed, and is not meant for production use.
> For persistent storage, use one of the other options (see relevant section above for instructions).

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
