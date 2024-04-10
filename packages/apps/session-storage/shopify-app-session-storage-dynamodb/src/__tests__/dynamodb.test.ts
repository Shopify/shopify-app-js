import * as child_process from 'child_process';
import {promisify} from 'util';

import {
  CreateTableCommand,
  DynamoDBClient,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import {
  batteryOfTests,
  poll,
} from '@shopify/shopify-app-session-storage-test-utils';

import {DynamoDBSessionStorage} from '../dynamodb';

const exec = promisify(child_process.exec);

describe('DynamoDBSessionStorage', () => {
  const sessionTableName = 'sessionTable';
  const shopIndexName = 'shopIndex';
  let storage: DynamoDBSessionStorage;

  let containerId: string;
  beforeAll(async () => {
    const dynamoDBClientConfig = {
      endpoint: 'http://localhost:8000',
      region: 'us-west-2',
      credentials: {
        accessKeyId: 'shopify',
        secretAccessKey: 'passify',
      },
    };
    const runCommand = await exec(
      'podman run -d -e AWS_ACCESS_KEY_ID=shopify -e AWS_SECRET_ACCESS_KEY=passify -p 8000:8000 amazon/dynamodb-local',
      {encoding: 'utf8'},
    );
    containerId = runCommand.stdout.trim();

    await poll(
      async () => {
        try {
          const client = new DynamoDBClient(dynamoDBClientConfig);
          await client.send(
            new CreateTableCommand({
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
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            }),
          );
          await waitUntilTableExists(
            {client, maxWaitTime: 120},
            {TableName: sessionTableName},
          );
        } catch (error) {
          // console.error(error);  // uncomment to see error for debugging tests
          return false;
        }
        return true;
      },
      {interval: 500, timeout: 20000},
    );

    storage = new DynamoDBSessionStorage({
      sessionTableName,
      shopIndexName,
      config: dynamoDBClientConfig,
    });
  });

  afterAll(async () => {
    await exec(`podman rm -f ${containerId}`);
  });

  batteryOfTests(async () => storage);
});
