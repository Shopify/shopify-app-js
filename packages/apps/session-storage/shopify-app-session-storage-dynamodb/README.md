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

## Table Schema

```js
{
  TableName: sessionTableName,
  AttributeDefinitions: [
    {AttributeName: 'id', AttributeType: 'S'},
    {AttributeName: 'shop', AttributeType: 'S'},
  ],
  KeySchema: [{AttributeName: 'id', KeyType: 'HASH'}],
  GlobalSecondaryIndexes: [
    {
      IndexName: shopIndexName,
      KeySchema: [{AttributeName: 'shop', KeyType: 'HASH'}],
      Projection: {ProjectionType: 'KEYS_ONLY'},
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  ],
  ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
}
```

### AWS Policy for DynamoDB

This policy must be attached to a user -- `dynamodb:Query` does not work with inline policies.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:DescribeTable"
      ],
      "Resource": ["arn:aws:dynamodb:<region>:<account-id>:table/<table-name>"]
    }
  ]
}
```

If you prefer to use your own implementation of a session storage mechanism that uses the `SessionStorage` interface, see the [implementing session storage guide](https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-session-storage/implementing-session-storage.md).
