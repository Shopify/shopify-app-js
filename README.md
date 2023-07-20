# `@shopify/shopify-app-js`

This repo is a collection of packages that make it easy for apps to integrate with Shopify.
They all build on top of the [@shopify/shopify-api](https://github.com/Shopify/shopify-api-js) package to cover specific use cases.

This mono-repo supports the following packages:

## App middleware

#### [`@shopify/shopify-app-remix`](./packages/shopify-app-remix)

- Provides functions to allow [Remix](https://remix.run) apps to communicate and authenticate requests from Shopify.

#### [`@shopify/shopify-app-express`](./packages/shopify-app-express)

- Creates a middleware layer that allows [Express.js](https://expressjs.com) apps to communicate with and authenticate requests from Shopify.

## Session storage options

#### [`@shopify/shopify-app-session-storage-prisma`](./packages/shopify-app-session-storage-prisma)

- Provides an implementation of `SessionStorage` that uses [Prisma](https://www.prisma.io/).

#### [`@shopify/shopify-app-session-storage-memory`](./packages/shopify-app-session-storage-memory)

- Provides a simplified memory-based implementation of `SessionStorage` for development.

#### [`@shopify/shopify-app-session-storage-sqlite`](./packages/shopify-app-session-storage-sqlite)

- Provides an implementation of `SessionStorage` that uses [SQLite](https://www.sqlite.org).

#### [`@shopify/shopify-app-session-storage-mongodb`](./packages/shopify-app-session-storage-mongodb)

- Provides an implementation of `SessionStorage` that uses [MongoDB](https://www.mongodb.com/home).

#### [`@shopify/shopify-app-session-storage-mysql`](./packages/shopify-app-session-storage-mysql)

- Provides an implementation of `SessionStorage` that uses [MySQL](https://www.mysql.com).

#### [`@shopify/shopify-app-session-storage-postgresql`](./packages/shopify-app-session-storage-postgresql)

- Provides an implementation of `SessionStorage` that uses [PostgreSQL](https://www.postgresql.org).

#### [`@shopify/shopify-app-session-storage-redis`](./packages/shopify-app-session-storage-redis)

- Provides an implementation of `SessionStorage` that uses [Redis](https://redis.io).

#### [`@shopify/shopify-app-session-storage-kv`](./packages/shopify-app-session-storage-kv)

- Provides an implementation of `SessionStorage` that uses [CloudFlare KV storage](https://www.cloudflare.com/products/workers-kv).

### Building a Session Storage Adaptor

#### [`@shopify/shopify-app-session-storage`](./packages/shopify-app-session-storage)

- Provides an interface that enables apps to store the sessions created during the OAuth process in `@shopify/shopify-api`.

- You can assign any implementation of this interface to the [Middleware layer](#app-middleware) packages. You can also call them directly from your app even if you're not building with [Express.js](https://expressjs.com).

### Community contributed implementations of `SessionStorage`

#### [`@shopify/shopify-app-session-storage-dynamodb`](./packages/shopify-app-session-storage-dynamodb)

- Provides an implementation of `SessionStorage` that uses [AWS DynamoDB](https://aws.amazon.com/dynamodb/). Contributed by [Chris](https://github.com/zirkelc) - thank you :clap:
