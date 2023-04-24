# Session Storage Adapter for Prisma

This package implements the `SessionStorage` interface that works with an instance of Prisma.

Session storage for prisma requires a `schema.prisma` with a Session table with at-least the following columns:

```prisma
model Session {
  id               String    @id
  shop             String
  state            String
  isOnline         Boolean   @default(false)
  scope            String?
  expires          DateTime?
  accessToken      String
  onlineAccessInfo String?
}
```

You can then instantiate and use `PrismaSessionStorage` like so:

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {SQLiteSessionStorage} from '@shopify/shopify-app-session-storage-prisma';
import {PrismaClient} from '@prisma/client';

// You can construct using either a filename...
const prisma = new PrismaClient();
const storage = new PrismaSessionStorage(prisma);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

> **Note**: If you use [SQLite](https://sqlite.com) with Prisma note that sqlite is a local, file-based SQL database. It persists all tables to a single file on your local disk. As such, it’s simple to set up and is a great choice for getting started with Shopify App development. However, it won’t work when your app getting scaled across multiple instances because they would each create their own database.

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
