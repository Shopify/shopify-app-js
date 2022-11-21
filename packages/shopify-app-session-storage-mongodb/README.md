# Session Storage

This folder contains implementations of the `SessionStorage` interface that works with the most common databases.

Below is a summary of the options:

| Storage option                  |              Node.js              |
| ------------------------------- | :-------------------------------: |
| [SQLite](#sqlite)               |                Yes                |
| [MySQL](#mysql)                 |                Yes                |
| [PostgreSQL](#postgresql)       |                Yes                |
| [MongoDB](#mongodb)             |                Yes                |
| [Redis](#redis)                 |                Yes                |
| [In-Memory](#in-memory)         | Yes (_default_, development only) |

> **Note**: Because this package supports multiple storage options, it does not include the session storage dependencies to avoid installing unnecessary packages.
>
> Depending on which storage option you choose, you'll need to add the dependency to your project manually, using
>
> ```shell
> npm install <package-name>
> # or
> yarn add <package-name>
> # or
> pnpm install <package-name>
> ```

If you prefer to use you own implementation of a session storage mechanism that is compatible with this Express package, see the [implementing session storage guide](implementing-session-storage.md)

## SQLite

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {SQLiteSessionStorage} from '@shopify/shopify-app-express/session-storage/sqlite';

const shopify = shopifyApp({
  sessionStorage: new SQLiteSessionStorage("/path/to/your.db"),
  ...
});
```

> **Note 1**: You will need to add the **`sqlite3`** dependency manually.

> **Note 2**: [SQLite] is a local, file-based SQL database. It persists all tables to a single file on your local disk. As such, it’s simple to set up and is a great choice for getting started with Shopify App development. However, it won’t work when your app getting scaled across multiple instances because they would each create their own database.

## MySQL

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {MySQLSessionStorage} from '@shopify/shopify-app-express/session-storage/mysql';

const shopify = shopifyApp({
  sessionStorage: new MySQLSessionStorage("mysql://username:password@host/database"),
  ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: MySQLSessionStorage.withCredentials({
    "host.com",
    "thedatabase",
    "username",
    "password",
  }),
  ...
});
```

> **Note**: You will need to add the **`mysql2`** dependency manually.

## PostgreSQL

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {PostgreSQLSessionStorage} from '@shopify/shopify-app-express/session-storage/postgresql';

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage("postgres://username:password@host/database"),
  ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: PostgreSQLSessionStorage.withCredentials(
    "host.com",
    "thedatabase",
    "username",
    "password",
  ),
  ...
});
```

> **Note**: You will need to add the **`pg`** dependency manually.

## MongoDB

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {MongoDBSessionStorage} from '@shopify/shopify-app-express/session-storage/mongodb';

const shopify = shopifyApp({
  sessionStorage: new MongoDBSessionStorage("mongodb://username:password@host/", "database"),
  ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: MongoDBSessionStorage.withCredentials(
    "host.com",
    "thedatabase",
    "username",
    "password",
  ),
  ...
});
```

> **Note**: You will need to add the **`mongodb`** dependency manually.

## Redis

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {RedisSessionStorage} from '@shopify/shopify-app-express/session-storage/redis';

const shopify = shopifyApp({
  sessionStorage: new RedisSessionStorage("redis://username:password@host/database"),
  ...
});

// OR

const shopify = shopifyApp({
  sessionStorage: RedisSessionStorage.withCredentials(
    "host.com",
    "thedatabase",
    "username",
    "password",
  ),
  ...
});
```

> **Note**: You will need to add the **`redis`** dependency manually.

## In-Memory

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {MemorySessionStorage} from '@shopify/shopify-app-express/session-storage/memory';

const shopify = shopifyApp({
  sessionStorage: new MemorySessionStorage(),
  ...
});
```

> **Note**: :warning: This session storage model is for local development only, to make it easier for developers to get started.
> It will delete all sessions if the app process gets restarted or redeployed, and is not meant for production use.
> For persistent storage, use one of the other options (see relevant section above for instructions).

[sqlite]: https://www.sqlite.org/
