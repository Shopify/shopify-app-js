# Session Storage Adapter for Redis

This package implements the `SessionStorage` interface that works with an instance of [Redis](https://redis.io/).

You can create an instance of `RedisSessionStorage` in several ways:

## Using a connection URL

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {RedisSessionStorage} from '@shopify/shopify-app-session-storage-redis';

const shopify = shopifyApp({
  sessionStorage: new RedisSessionStorage(
    'redis://username:password@host/database',
  ),
  // ...
});
```

## Using a URL object

```js
const shopify = shopifyApp({
  sessionStorage: new RedisSessionStorage(
    new URL('redis://username:password@host/database'),
  ),
  // ...
});
```

## Using credential components

```js
const shopify = shopifyApp({
  sessionStorage: RedisSessionStorage.withCredentials(
    'host.com',
    'thedatabase',
    'username',
    'password',
  ),
  // ...
});
```

## Redis client options

For URL and credential-based connections, this adapter uses `redis` v6 with `RESP: 2` and `commandOptions.timeout: undefined`, preserving its previous protocol and unbounded queue-wait defaults. Upstream `redis` v6 instead defaults to RESP3 and a 5,000 ms queue-wait timeout. This timeout limits how long a command waits to be written to the socket, not server execution or reply time.

Pass Redis client options as the second argument to override these defaults. For example, to limit queue wait to five seconds while keeping RESP2:

```js
const sessionStorage = new RedisSessionStorage(
  'redis://username:password@host/database',
  {commandOptions: {timeout: 5000}},
);
```

An explicit `RESP: 3` opts into upstream RESP3 handshake and maintenance behavior. With `redis` 6.3.0, keep RESP2 for passwordless named ACL users and IPv6-literal URLs.

## Using a RedisClient instance

You can supply a client created with `redis` v5 or v6. Configure its protocol and queue-wait policy when creating it; the adapter does not change the supplied client's options or apply its own client defaults.

> [!NOTE]
> Remember that `RedisSessionStorage` will connect to the database, but won't disconnect from it.
> If you need to restart the connection, you'll need to manually connect again for the storage to continue working.

```js
import {RedisClientOptions, createClient} from 'redis';
const client = createClient({url: 'redis://username:password@host/database'});

const shopify = shopifyApp({
  sessionStorage: new RedisSessionStorage(client),
  // ...
});
```

## Refresh Token Support

This package supports storing refresh tokens for apps using expiring offline access tokens. No migration or schema changes are required - Redis storage automatically preserves all Session fields through JSON serialization.

> [!NOTE]
> The `future.expiringOfflineAccessTokens` flag is available in `@shopify/shopify-app-remix` and `@shopify/shopify-app-react-router` only. It does not apply to `@shopify/shopify-app-express`.

To enable expiring offline access tokens in your app (React Router or Remix):

```js
import {shopifyApp} from '@shopify/shopify-app-react-router';
import {RedisSessionStorage} from '@shopify/shopify-app-session-storage-redis';

const shopify = shopifyApp({
  sessionStorage: new RedisSessionStorage(
    'redis://username:password@host/database',
  ),
  future: {
    expiringOfflineAccessTokens: true,
  },
  // ...
});
```

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
