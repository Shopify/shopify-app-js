# Shopify API and app tools for JavaScript

This repository contains packages you can use to interact with Shopify's APIs.
You can use these packages to create clients for those APIs directly, or to create apps using TypeScript / JavaScript.

It is organized as a [monorepo](https://monorepo.tools/), which includes multiple packages that can be used together.

## Packages

The packages in this repository can be used to extend Shopify in different ways:

- [API clients](#api-clients)
- [Apps and middlewares](#apps-and-middlewares)
- [Session storage](#session-storage)

### [API clients](./packages/api-clients)

These packages make it easy to interact with Shopify's APIs if you have the required [access tokens](https://shopify.dev/docs/apps/auth#types-of-authentication-and-authorization-methods).

| Package                                                                                  | Latest version                                                                                                                                          | Description                                                                                                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [`@shopify/admin-api-client`](./packages/api-clients/admin-api-client/#readme)           | [![Latest badge](https://img.shields.io/npm/v/@shopify/admin-api-client/latest.svg)](https://www.npmjs.com/package/@shopify/admin-api-client)           | Client for the [GraphQL](https://shopify.dev/docs/api/admin-graphql) and [REST](https://shopify.dev/docs/api/admin-rest) Admin APIs. |
| [`@shopify/storefront-api-client`](./packages/api-clients/storefront-api-client/#readme) | [![Latest badge](https://img.shields.io/npm/v/@shopify/storefront-api-client/latest.svg)](https://www.npmjs.com/package/@shopify/storefront-api-client) | Client for the GraphQL [Storefront](https://shopify.dev/docs/api/storefront) API.                                                    |
| [`@shopify/graphql-client`](./packages/api-clients/graphql-client/#readme)               | [![Latest badge](https://img.shields.io/npm/v/@shopify/graphql-client/latest.svg)](https://www.npmjs.com/package/@shopify/graphql-client)               | Generic GraphQL API client.                                                                                                          |
| [`@shopify/api-codegen-preset`](./packages/api-clients/api-codegen-preset/#readme)       | [![Latest badge](https://img.shields.io/npm/v/@shopify/api-codegen-preset/latest.svg)](https://www.npmjs.com/package/@shopify/api-codegen-preset)       | [Codegen](https://the-guild.dev/graphql/codegen) preset for Shopify APIs. Automatically integrates with the clients above.           |

### [Apps and middlewares](./packages/apps)

These packages make it easy to create Shopify apps with TS / JS using different tech stacks.

| Package                                                                       | Latest version                                                                                                                                      | Description                                                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`@shopify/shopify-api`](./packages/apps/shopify-api/#readme)                 | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-api/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-api)                 | Framework and runtime agnostic library for Shopify OAuth, APIs, webhooks, and more.    |
| [`@shopify/shopify-app-remix`](./packages/apps/shopify-app-remix/#readme)     | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-remix/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-remix)     | Implementation of `@shopify/shopify-api` to make it easy to create apps using Remix.   |
| [`@shopify/shopify-app-express`](./packages/apps/shopify-app-express/#readme) | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-express/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-express) | Implementation of `@shopify/shopify-api` to make it easy to create apps using Express. |

### [Session storage](./packages/apps/session-storage)

These packages provide database-specific implementations to manage `@shopify/shopify-api` sessions.

| Package                                                                                                                            | Latest version                                                                                                                                                                            | Description                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`@shopify/shopify-app-session-storage`](./packages/apps/session-storage/shopify-app-session-storage#readme)                       | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage)                       | Provides the interfaces used by the app middleware packages to write custom packages. |
| [`@shopify/shopify-app-session-storage-drizzle`](./packages/apps/session-storage/shopify-app-session-storage-drizzle#readme)       | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-drizzle/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-drizzle)       | Drizzle implementation of the session storage interface.                              |
| [`@shopify/shopify-app-session-storage-dynamodb`](./packages/apps/session-storage/shopify-app-session-storage-dynamodb#readme)     | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-dynamodb/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-dynamodb)     | DynamoDB implementation of the session storage interface.                             |
| [`@shopify/shopify-app-session-storage-kv`](./packages/apps/session-storage/shopify-app-session-storage-kv#readme)                 | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-kv/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-kv)                 | Cloudflare KV implementation of the session storage interface.                        |
| [`@shopify/shopify-app-session-storage-memory`](./packages/apps/session-storage/shopify-app-session-storage-memory#readme)         | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-memory/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-memory)         | Memory implementation of the session storage interface.                               |
| [`@shopify/shopify-app-session-storage-mongodb`](./packages/apps/session-storage/shopify-app-session-storage-mongodb#readme)       | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-mongodb/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mongodb)       | MongoDB implementation of the session storage interface.                              |
| [`@shopify/shopify-app-session-storage-mysql`](./packages/apps/session-storage/shopify-app-session-storage-mysql#readme)           | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-mysql/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mysql)           | Mysql implementation of the session storage interface.                                |
| [`@shopify/shopify-app-session-storage-postgresql`](./packages/apps/session-storage/shopify-app-session-storage-postgresql#readme) | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-postgresql/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-postgresql) | PostgreSQL implementation of the session storage interface.                           |
| [`@shopify/shopify-app-session-storage-prisma`](./packages/apps/session-storage/shopify-app-session-storage-prisma#readme)         | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-prisma/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma)         | Prisma implementation of the session storage interface.                               |
| [`@shopify/shopify-app-session-storage-redis`](./packages/apps/session-storage/shopify-app-session-storage-redis#readme)           | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-redis/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-redis)           | Redis implementation of the session storage interface.                                |
| [`@shopify/shopify-app-session-storage-sqlite`](./packages/apps/session-storage/shopify-app-session-storage-sqlite#readme)         | [![Latest badge](https://img.shields.io/npm/v/@shopify/shopify-app-session-storage-sqlite/latest.svg)](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-sqlite)         | SQLite implementation of the session storage interface.                               |
