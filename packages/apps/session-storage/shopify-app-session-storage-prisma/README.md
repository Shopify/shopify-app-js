# Session Storage Adapter for Prisma

This package implements the `SessionStorage` interface that works with an instance of Prisma.

Session storage for prisma requires a `schema.prisma` with a Session table with at-least the following columns:

```prisma
model Session {
  id          String    @id
  shop        String
  state       String
  isOnline    Boolean   @default(false)
  scope       String?
  expires     DateTime?
  accessToken String
  userId      BigInt?
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

> **Note**: If you use [SQLite](https://sqlite.com) with Prisma note that sqlite is a local, file-based SQL database. It persists all tables to a single file on your local disk. As such, it’s simple to set up and is a great choice for getting started with Shopify App development. However, it won’t work when your app getting scaled across multiple instances because they would each create their own database.

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).

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

## Troubleshooting

If there is an issue with your schema that prevents it from finding the `Session` table, this package will throw a `MissingSessionTableError`.
Some common reasons for that are:

1. The database was not migrated.
1. The `Session` table above was not added to the schema.
1. The table is in the schema, but isn't named `Session`.

Here are some possible solutions for this issue:

1. Ensure you've run [the `migrate` command](https://www.prisma.io/docs/reference/api-reference/command-reference#prisma-migrate) to apply the schema.
1. Ensure you've copied the schema above into your `prisma.schema` file.
1. If you've made changes to the table, make sure it's still called `Session`.
