# Session Storage Adapter for SQLite

This package implements the `SessionStorage` interface that works with an instance of SQLite.

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {SQLiteSessionStorage} from '@shopify/shopify-app-session-storage-sqlite';
import sqlite3 from 'sqlite3';

// You can construct using either a filename...
const storage = new SQLiteSessionStorage('/path/to/your.db');

// or an existing sqlite3.Database
const database = new sqlite3.Database('/path/to/your.db');
const storage = new SQLiteSessionStorage(database);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

> **Note**: [SQLite](https://sqlite.com) is a local, file-based SQL database. It persists all tables to a single file on your local disk. As such, it’s simple to set up and is a great choice for getting started with Shopify App development. However, it won’t work when your app getting scaled across multiple instances because they would each create their own database.

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
