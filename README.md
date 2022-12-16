# `@shopify/shopify-app-js`

This repo is a collection of packages that make it easy for apps to integrate with Shopify.
They all build on top of the [@shopify/shopify-api](https://github.com/Shopify/shopify-api-js) package to cover specific use cases.

This mono-repo supports the following packages:

## App middleware

#### [`@shopify/shopify-app-express`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-express)

Creates a middleware layer that allows [Express.js](https://expressjs.com) apps to communicate with and authenticate requests from Shopify.

## Session storage options

#### [`@shopify/shopify-app-session-storage`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides an interface that enables apps to store the sessions created during the OAuth process in `@shopify/shopify-api`.

You can assign any implementation of this interface to the `@shopify/shopify-app-express` package, but you can also call them directly from your app if you're not building with Express.js.

#### [`@shopify/shopify-app-session-storage-memory`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides a simplified memory-based implementation of `SessionStorage` for development.

#### [`@shopify/shopify-app-session-storage-sqlite`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides an implementation of `SessionStorage` that uses [SQLite](https://www.sqlite.org).

#### [`@shopify/shopify-app-session-storage-mongodb`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides an implementation of `SessionStorage` that uses [MongoDB](https://www.mongodb.com/home).

#### [`@shopify/shopify-app-session-storage-mysql`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides an implementation of `SessionStorage` that uses [MySQL](https://www.mysql.com).

#### [`@shopify/shopify-app-session-storage-postgresql`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides an implementation of `SessionStorage` that uses [PostgreSQL](https://www.postgresql.org).

#### [`@shopify/shopify-app-session-storage-redis`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides an implementation of `SessionStorage` that uses [Redis](https://redis.io).

#### [`@shopify/shopify-app-session-storage-kv`](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage)

Provides an implementation of `SessionStorage` that uses [CloudFlare KV storage](https://www.cloudflare.com/products/workers-kv).
