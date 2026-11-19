import {createClient, RedisClientOptions} from 'redis';
import {DBConnection} from '@shopify/shopify-app-session-storage';

// RedisClientOptions defaults its RESP type to 3, but callers can use either protocol.
export type RedisConnectionOptions = Omit<RedisClientOptions, 'RESP'> & {
  RESP?: 2 | 3;
};

// Only require the operations used by the adapter, not a particular client version.
export interface RedisClient {
  readonly isReady: boolean;
  connect(): Promise<unknown>;
  quit(): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  del(key: string): Promise<number>;
}

export class RedisConnection implements DBConnection {
  sessionStorageIdentifier: string;
  private client: RedisClient;

  constructor(
    urlOrClient: string | URL | RedisClient,
    options: RedisConnectionOptions,
    keyPrefix: string,
  ) {
    this.init(urlOrClient, options);
    this.sessionStorageIdentifier = keyPrefix;
  }

  query(_query: string, _params: any[]): Promise<any[]> {
    throw new Error('Method not implemented. Use get(string, boolean) instead');
  }

  async connect(): Promise<void> {
    if (!this.client.isReady) {
      await this.client.connect();
    }
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
    return `${this.sessionStorageIdentifier}_${name}`;
  }

  private buildKey(baseKey: string, addKeyPrefix: boolean): string {
    return addKeyPrefix ? this.generateFullKey(baseKey) : baseKey;
  }

  private init(
    urlOrClient: string | URL | RedisClient,
    options: RedisConnectionOptions,
  ) {
    if (typeof urlOrClient === 'string' || urlOrClient instanceof URL) {
      const client = createClient({
        ...options,
        // Preserve authentication and negotiation even when RESP is explicitly undefined.
        RESP: options.RESP ?? 2,
        url: urlOrClient.toString(),
        // v6 otherwise limits queued commands to five seconds, unlike v5.
        commandOptions: {timeout: undefined, ...options.commandOptions},
      });
      client.on('error', this.eventHandler);
      client.on('connect', this.eventHandler);
      client.on('reconnecting', this.eventHandler);
      client.on('ready', this.eventHandler);
      this.client = client;
    } else {
      this.client = urlOrClient;
    }
  }

  private eventHandler = (..._args: any[]) => {};
}
