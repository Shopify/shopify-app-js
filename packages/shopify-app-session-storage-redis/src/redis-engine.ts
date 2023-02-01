import {createClient} from 'redis';
import {DBEngine} from '@shopify/shopify-app-session-storage';

type RedisClient = ReturnType<typeof createClient>;

export class RedisEngine implements DBEngine {
  sessionTableName: string;
  useHasTable: boolean;
  sqlArgumentPlaceholder: string;

  constructor(
    private client: RedisClient,
    prefixKey: string,
    onError?: (...args: any[]) => void,
  ) {
    this.client = client;
    this.sessionTableName = prefixKey;
    this.useHasTable = false;
    this.sqlArgumentPlaceholder = '';

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
    return `${this.sessionTableName}_${name}`;
  }

  delete(name: string): Promise<any> {
    return this.client.del(this.fullKey(name));
  }

  connect(): Promise<void> {
    return this.client.connect();
  }

  disconnect(): Promise<void> {
    let result: Promise<void> = Promise.reject();
    this.client
      .quit()
      .then((_) => {
        result = Promise.resolve();
      })
      .catch((_) => {
        result = Promise.reject();
      });

    return result;
  }

  hasTable(_: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getArgumentPlaceholder(_: number): string {
    return `${this.sqlArgumentPlaceholder}`;
  }
}
