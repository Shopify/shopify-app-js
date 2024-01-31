import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';
import {Session, SessionParams} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

export interface DynamoDBSessionStorageOptions {
  sessionTableName: string;
  shopIndexName: string;
  config?: DynamoDBClientConfig;
}

const defaultDynamoDBSessionStorageOptions: DynamoDBSessionStorageOptions = {
  sessionTableName: 'shopify_sessions',
  shopIndexName: 'shop_index',
};

export class DynamoDBSessionStorage implements SessionStorage {
  private client: DynamoDBClient;
  private options: DynamoDBSessionStorageOptions;

  constructor(opts?: DynamoDBSessionStorageOptions) {
    this.options = {...defaultDynamoDBSessionStorageOptions, ...opts};
    this.client = new DynamoDBClient({...this.options.config});
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.client.send(
      new PutItemCommand({
        TableName: this.options.sessionTableName,
        Item: this.serializeSession(session),
      }),
    );

    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    if (!id) return undefined;

    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.options.sessionTableName,
        Key: this.serializeId(id),
      }),
    );

    return result.Item ? this.deserializeSession(result.Item) : undefined;
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.client.send(
      new DeleteItemCommand({
        TableName: this.options.sessionTableName,
        Key: this.serializeId(id),
      }),
    );

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await Promise.all(ids.map((id) => this.deleteSession(id)));
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.options.sessionTableName,
        IndexName: this.options.shopIndexName,
        KeyConditionExpression: 'shop = :shop',
        ExpressionAttributeValues: marshall({
          ':shop': shop,
        }),
        ProjectionExpression: 'id, shop',
      }),
    );

    const sessions = await Promise.all(
      result.Items?.map((item) => this.loadSession(this.deserializeId(item))) ||
        [],
    );

    return sessions.filter(
      (session): session is Session => session !== undefined,
    );
  }

  private serializeId(id: string): Record<string, AttributeValue> {
    return marshall({id});
  }

  private deserializeId(id: Record<string, AttributeValue>): string {
    return unmarshall(id).id;
  }

  private serializeSession(session: Session): Record<string, AttributeValue> {
    // DynamoDB doesn't support Date objects, so we need to convert it to an ISO string
    const rawSession = {
      ...session.toObject(),
      expires: session.expires?.toISOString(),
    };

    return marshall(rawSession, {
      removeUndefinedValues: true,
    });
  }

  private deserializeSession(session: Record<string, AttributeValue>): Session {
    const rawSession = unmarshall(session) as SessionParams;

    // Convert the ISO string back to a Date object
    return new Session({
      ...rawSession,
      expires: rawSession.expires ? new Date(rawSession.expires) : undefined,
    });
  }
}
