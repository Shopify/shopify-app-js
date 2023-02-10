import {createClient} from 'redis';
import {DBConnection} from '@shopify/shopify-app-session-storage';

type RedisClient = ReturnType<typeof createClient>;

export class RedisConnection implements DBConnection {
  sessionDBIdentifier: string;

  constructor(
    private client: RedisClient,
    keyPrefix: string,
    onError?: (...args: any[]) => void,
  ) {
    this.client = client;
    this.sessionDBIdentifier = keyPrefix;

    if (onError) {
      this.client.on('error', onError);
    }
  }

  query(query: string, params: any[]): Promise<any[]> {
    throw new Error('Method not implemented. Use get(string, boolean) instead');
  }

  async connect(): Promise<void> {
    return this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async keys(name: string): Promise<any> {
    return this.client.keys(name);
  }

  async set(baseKey: string, value: any, addKeyPrefix = true) {
    await this.client.set(this.buildKey(baseKey, addKeyPrefix), value);
  }

  async del(baseKey: string, addKeyPrefix = true): Promise<any> {
    return this.client.del(this.buildKey(baseKey, addKeyPrefix));
  }

  async get(baseKey: string, addKeyPrefix = true): Promise<any> {
    return this.client.get(this.buildKey(baseKey, addKeyPrefix));
  }

  generateFullKey(name: string): string {
    return `${this.sessionDBIdentifier}_${name}`;
  }

  private buildKey(baseKey: string, addKeyPrefix: boolean): string {
    return addKeyPrefix ? this.generateFullKey(baseKey) : baseKey;
  }
}
