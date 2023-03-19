import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';

import {DynamoDBSessionStorage} from '../dynamodb';

describe('DynamoDBSessionStorage', () => {
  const client = new DynamoDBClient({});
  const sessionTableName = 'sessionTable';
  let storage: DynamoDBSessionStorage;

  beforeAll(async () => {
    try {
      await client.send(
        new DescribeTableCommand({TableName: sessionTableName}),
      );
    } catch (error) {
      await client.send(
        new CreateTableCommand({
          TableName: sessionTableName,
          AttributeDefinitions: [{AttributeName: 'id', AttributeType: 'S'}],
          KeySchema: [{AttributeName: 'id', KeyType: 'HASH'}],
          ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1},
        }),
      );
      await waitUntilTableExists(
        {client, maxWaitTime: 60},
        {TableName: sessionTableName},
      );
    }
    storage = new DynamoDBSessionStorage({sessionTableName});
  });

  afterAll(async () => {
    await client.send(new DeleteTableCommand({TableName: sessionTableName}));
  });

  batteryOfTests(async () => storage);
});
