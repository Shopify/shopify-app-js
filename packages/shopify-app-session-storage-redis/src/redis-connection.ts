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

  query(key: string, _: any[] = []): Promise<any> {
    return this.client.get(this.fullKey(key));
  }

  getWithoutFullKey(key: string, _: any[] = []): Promise<any> {
    return this.client.get(key);
  }

  keys(name: string): Promise<any> {
    return this.client.keys(name);
  }

  async setKey(name: string, value: any) {
    await this.client.set(this.fullKey(name), value);
  }

  fullKey(name: string): string {
    return `${this.sessionDBIdentifier}_${name}`;
  }

  delete(name: string): Promise<any> {
    return this.client.del(this.fullKey(name));
  }

  connect(): Promise<void> {
    return this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
