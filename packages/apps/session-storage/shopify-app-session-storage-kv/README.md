# Session Storage Adapter for CloudFlare KV

CloudFlare's [KV](https://www.cloudflare.com/products/workers-kv/) storage can be used on worker runtimes.
Before using it, you'll need to set up a namespace for your sessions and pass in a `KVNamespace` object.
You can do that either when creating an instance of `KVSessionStorage`, or by calling the `setNamespace` method.

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {KVSessionStorage} from '@shopify/shopify-app-session-storage-kv';

const shopify = shopifyApp({
  sessionStorage: new KVSessionStorage(),
  // ...
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    shopify.config.sessionStorage.setNamespace(env.MY_KV_NAMESPACE);
    // Handle request
  },
};

// OR

import {Miniflare} from 'miniflare';
const mf = new Miniflare({
  kvNamespaces: ['MY_KV_NAMESPACE'],
});
const shopify = shopifyApp({
  sessionStorage: new KVSessionStorage(
    await mf.getKVNamespace('MY_KV_NAMESPACE'),
  ),
  // ...
});
```

## Refresh Token Support

This package supports storing refresh tokens for apps using expiring offline access tokens. No migration or schema changes are required - KV storage automatically preserves all Session fields through JSON serialization.

> [!NOTE]
> The `future.expiringOfflineAccessTokens` flag is available in `@shopify/shopify-app-remix` and `@shopify/shopify-app-react-router` only. It does not apply to `@shopify/shopify-app-express`.

To enable expiring offline access tokens in your app (React Router or Remix):

```js
import {shopifyApp} from '@shopify/shopify-app-react-router';
import {KVSessionStorage} from '@shopify/shopify-app-session-storage-kv';

const shopify = shopifyApp({
  sessionStorage: new KVSessionStorage(),
  future: {
    expiringOfflineAccessTokens: true,
  },
  // ...
});
```

If you prefer to use your own implementation of a session storage mechanism that uses the `SessionStorage` interface, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
