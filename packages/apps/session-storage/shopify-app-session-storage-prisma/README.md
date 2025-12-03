# Session Storage Adapter for Prisma

This package implements the `SessionStorage` interface that works with an instance of Prisma.

Session storage for prisma requires a `schema.prisma` with a Session table with at-least the following columns:

```prisma
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  firstName     String?
  lastName      String?
  email         String?
  accountOwner  Boolean?
  locale        String?
  collaborator  Boolean?
  emailVerified Boolean?
  refreshToken  String?
  refreshTokenExpires DateTime?
}
```

> [!WARNING]
> Some DB adapters adapters may set a maximum length for the String type by default, please ensure your fields allow for long enough strings.
> See <https://www.prisma.io/docs/orm/reference/prisma-schema-reference#string> for more information

You can then instantiate and use `PrismaSessionStorage` like so:

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {PrismaSessionStorage} from '@shopify/shopify-app-session-storage-prisma';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const storage = new PrismaSessionStorage(prisma);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

## Options

You can also pass in some optional flags to tweak the behavior of the adapter.

### Custom table name

You can pass in the `tableName` option if you want to use a different table name in your schema.
For example:

```ts
const storage = new PrismaSessionStorage(prisma, {
  tableName: 'MyCustomSession',
});
```

> **Note**: If you use [SQLite](https://sqlite.com) with Prisma note that sqlite is a local, file-based SQL database. It persists all tables to a single file on your local disk. As such, it’s simple to set up and is a great choice for getting started with Shopify App development. However, it won’t work when your app getting scaled across multiple instances because they would each create their own database.

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).

### Connection retries

When the storage starts up, it will connect to the database during startup so the app can start.
If the DB server takes too long to start, the setup may fail.

To avoid that, you can pass in the `connectionRetries` and `connectionRetryIntervalMs` options to control how many times to retry, and how long to wait between tries, respectively.
For example:

```ts
const storage = new PrismaSessionStorage(prisma, {
  // Default values
  connectionRetries: 2,
  connectionRetryIntervalMs: 5000,
});
```

## Updating your database

When updating the type of database you are using, you may need to make some changes to your project for Prisma to work correctly. Please review the prisma documentation for your specific database type for configuration.

- [MongoDB](https://www.prisma.io/docs/orm/overview/databases/mongodb)
- [MySQL](https://www.prisma.io/docs/orm/overview/databases/mysql)
- [PostgreSQL](https://www.prisma.io/docs/orm/overview/databases/postgresql)

## Troubleshooting

### `MissingSessionTableError` error is thrown

Some common reasons for that are:

1. The database was not migrated.
2. The `Session` table above was not added to the schema.
3. The table is in the schema, but isn't named `Session`.

Here are some possible solutions for this issue:

1. Ensure you've run [the `migrate` command](https://www.prisma.io/docs/reference/api-reference/command-reference#prisma-migrate) to apply the schema.
1. Ensure you've copied the schema above into your `prisma.schema` file.
1. If you've made changes to the table, make sure it's still called `Session`.

### MongoDB

If you choose to use MongoDB with prisma, MongoDB support in Prisma has some gotchas that you should be aware of.

Alternatively you can use a MongoDB database directly with the [MongoDB session storage adapter](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mongodb).

#### Mapping the id field

In MongoDB, an ID must be a single field that defines an `@id` attribute and a `@map("\_id")` attribute. The prisma adapter expects the ID field to be the ID of the session, and not the \_id field of the document.

You'll need to make some modifications to the schema and prisma configuration. For more information please see the [Prisma MongoDB documentation](https://www.prisma.io/docs/orm/overview/databases/mongodb).

To make this work add a new field to the schema that maps the \_id field to the id field. For more information see the [Prisma documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-an-id-field)

```prisma
model Session {
  session_id  String    @id @default(auto()) @map("_id") @db.ObjectId
  id          String    @unique
...
}
```

#### Error: The "mongodb" provider is not supported with this command

MongoDB does not support the [prisma migrate](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview) command. Instead, you can use the [prisma db push](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#db-push) command and update the `shopify.web.toml` file with the following commands. If you are using MongoDB please see the [Prisma documentation](https://www.prisma.io/docs/orm/overview/databases/mongodb) for more information.

```toml
[commands]
predev = "npx prisma generate && npx prisma db push"
dev = "npx prisma migrate deploy && npm exec react-router dev"
```

#### Prisma needs to perform transactions, which requires your mongodb server to be run as a replica set

See the [Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/mongodb/connect-your-database-node-mongodb) for connecting to a MongoDB database.
