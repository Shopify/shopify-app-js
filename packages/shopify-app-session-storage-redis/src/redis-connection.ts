import {createClient} from 'redis';
import {DBConnection} from '@shopify/shopify-app-session-storage';

type RedisClient = ReturnType<typeof createClient>;

export class RedisConnection implements DBConnection {
  sessionDBIdentifier: string;

  constructor(
    private client: RedisClient,
    prefixKey: string,
    onError?: (...args: any[]) => void,
  ) {
    this.client = client;
    this.sessionDBIdentifier = prefixKey;

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
    let finalKey = baseKey;
    if (addKeyPrefix) {
      finalKey = this.generateFullKey(baseKey);
    }
    await this.client.set(finalKey, value);
  }

  async del(baseKey: string, addKeyPrefix = true): Promise<any> {
    let finalKey = baseKey;
    if (addKeyPrefix) {
      finalKey = this.generateFullKey(baseKey);
    }
    return this.client.del(finalKey);
  }

  async get(baseKey: string, addKeyPrefix = true): Promise<any> {
    let finalKey = baseKey;
    if (addKeyPrefix) {
      finalKey = this.generateFullKey(baseKey);
    }

    return this.client.get(finalKey);
  }

  generateFullKey(name: string): string {
    return `${this.sessionDBIdentifier}_${name}`;
  }
}
