# Session Storage Adapter for AWS DynamoDB

This package implements the `SessionStorage` interface that works with an AWS DynamoDB database.

Contributed by [Chris](https://github.com/zirkelc) - thank you :clap:

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {DynamoDBSessionStorage} from '@shopify/shopify-app-session-storage-dynamodb';

// You can use the default options
const storage = new DynamoDBSessionStorage();

// or, if you want to use a different session table name and shop index name
const storage = new DynamoDBSessionStorage({ sessionTableName: 'my-session-table', shopIndexName: 'my-shop-index' });

// or, if you want to use a different region or credentials
const storage = new DynamoDBSessionStorage({ config: { region: 'us-west-2', credentials: { ... } } });

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

If you prefer to use your own implementation of a session storage mechanism that uses the `SessionStorage` interface, see the [implementing session storage guide](../shopify-app-session-storage/implementing-session-storage.md).
