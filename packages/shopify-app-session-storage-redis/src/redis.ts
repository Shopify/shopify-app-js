import {createClient, RedisClientOptions} from 'redis';
import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

type RedisClient = ReturnType<typeof createClient>;
export interface RedisSessionStorageOptions extends RedisClientOptions {
  sessionKeyPrefix: string;
  onError?: (...args: any[]) => void;
}
const defaultRedisSessionStorageOptions: RedisSessionStorageOptions = {
  sessionKeyPrefix: 'shopify_sessions',
};

export class RedisSessionStorage implements SessionStorage {
  static withCredentials(
    host: string,
    db: number,
    username: string,
    password: string,
    opts: Partial<RedisSessionStorageOptions>,
  ) {
    return new RedisSessionStorage(
      new URL(
        `redis://${encodeURIComponent(username)}:${encodeURIComponent(
          password,
        )}@${host}/${db}`,
      ),
      opts,
    );
  }

  public readonly ready: Promise<void>;
  private options: RedisSessionStorageOptions;
  private client: RedisClient;

  constructor(
    private dbUrl: URL,
    opts: Partial<RedisSessionStorageOptions> = {},
  ) {
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultRedisSessionStorageOptions, ...opts};
    this.ready = this.init();
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    await this.client.set(
      this.fullKey(session.id),
      JSON.stringify(session.toPropertyArray()),
    );
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;

    let rawResult: any = await this.client.get(this.fullKey(id));

    if (!rawResult) return undefined;
    rawResult = JSON.parse(rawResult);

    return Session.fromPropertyArray(rawResult);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;
    await this.client.del(this.fullKey(id));
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;
    await this.client.del(ids.map((id) => this.fullKey(id)));
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;

    const keys = await this.client.keys('*');
    const results: Session[] = [];
    for (const key of keys) {
      const rawResult = await this.client.get(key);
      if (!rawResult) continue;

      const session = Session.fromPropertyArray(JSON.parse(rawResult));
      if (session.shop === shop) results.push(session);
    }

    return results;
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }

  private fullKey(name: string): string {
    return `${this.options.sessionKeyPrefix}_${name}`;
  }

  private async init() {
    this.client = createClient({
      ...this.options,
      url: this.dbUrl.toString(),
    });
    if (this.options.onError) {
      this.client.on('error', this.options.onError);
    }
    await this.client.connect();
  }
}
