import {RedisClientOptions, createClient} from 'redis';
import {Session} from '@shopify/shopify-api';
import {
  SessionStorage,
  SessionStorageMigratorOptions,
  SessionStorageMigrator,
} from '@shopify/shopify-app-session-storage';

import {migrationList} from './migrations';
import {RedisConnection} from './redis-connection';
import {RedisSessionStorageMigrator} from './redis-migrator';

type RedisClient = ReturnType<typeof createClient>;

/* eslint-disable @shopify/typescript/prefer-pascal-case-enums */
enum ShopifyStorageOption {
  sessionKeyPrefix = 'sessionKeyPrefix',
  migratorOptions = 'migratorOptions',
  onError = 'onError',
}
/* eslint-enable @shopify/typescript/prefer-pascal-case-enums */

export interface RedisSessionStorageOptions extends RedisClientOptions {
  [ShopifyStorageOption.sessionKeyPrefix]: string;
  [ShopifyStorageOption.migratorOptions]?: SessionStorageMigratorOptions;
  [ShopifyStorageOption.onError]?: (...args: any[]) => void;
}

const defaultRedisSessionStorageOptions: RedisSessionStorageOptions = {
  sessionKeyPrefix: 'shopify_sessions',
  migratorOptions: {
    migrationDBIdentifier: 'migrations',
  },
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
  private internalInit: Promise<void>;
  private options: RedisSessionStorageOptions;
  private client: RedisConnection;
  private migrator: SessionStorageMigrator;

  constructor(
    urlOrClient: URL | string | RedisClient,
    opts: Partial<RedisSessionStorageOptions> = {},
  ) {
    const allowedClientKeys = Object.keys(ShopifyStorageOption);
    const disallowedClientKeys = Object.keys(opts).filter(
      (key) => !allowedClientKeys.includes(key),
    );

    if (
      typeof urlOrClient !== 'string' &&
      !(urlOrClient instanceof URL) &&
      disallowedClientKeys.length > 0
    ) {
      throw new Error(
        'Passing a RedisClient instance is not supported with options. Set the options when creating the client ' +
          'instead.',
      );
    }

    this.options = {...defaultRedisSessionStorageOptions, ...opts};
    this.internalInit = this.init(urlOrClient);
    this.migrator = new RedisSessionStorageMigrator(
      this.client,
      this.options.migratorOptions,
      migrationList,
    );
    this.ready = this.migrator.applyMigrations(this.internalInit);
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    await this.client.set(
      session.id,
      JSON.stringify(session.toPropertyArray(true)),
    );
    await this.addKeyToShopList(session);
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;

    let rawResult: any = await this.client.get(id);

    if (!rawResult) return undefined;
    rawResult = JSON.parse(rawResult);

    return Session.fromPropertyArray(rawResult, true);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;
    const session = await this.loadSession(id);
    if (session) {
      await this.removeKeyFromShopList(session.shop, id);
      await this.client.del(id);
    }
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;
    await Promise.all(ids.map((id) => this.deleteSession(id)));
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;

    const idKeysArrayString = await this.client.get(shop);
    if (!idKeysArrayString) return [];

    const idKeysArray = JSON.parse(idKeysArrayString);
    const results: Session[] = [];
    for (const idKey of idKeysArray) {
      const rawResult = await this.client.get(idKey, false);
      if (!rawResult) continue;

      const session = Session.fromPropertyArray(JSON.parse(rawResult), true);
      results.push(session);
    }

    return results;
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  private async addKeyToShopList(session: Session) {
    const shopKey = session.shop;
    const idKey = this.client.generateFullKey(session.id);
    const idKeysArrayString = await this.client.get(shopKey);

    if (idKeysArrayString) {
      const idKeysArray = JSON.parse(idKeysArrayString);

      if (!idKeysArray.includes(idKey)) {
        idKeysArray.push(idKey);
        await this.client.set(shopKey, JSON.stringify(idKeysArray));
      }
    } else {
      await this.client.set(shopKey, JSON.stringify([idKey]));
    }
  }

  private async removeKeyFromShopList(shop: string, id: string) {
    const shopKey = shop;
    const idKey = this.client.generateFullKey(id);
    const idKeysArrayString = await this.client.get(shopKey);

    if (idKeysArrayString) {
      const idKeysArray = JSON.parse(idKeysArrayString);
      const index = idKeysArray.indexOf(idKey);

      if (index > -1) {
        idKeysArray.splice(index, 1);
        await this.client.set(shopKey, JSON.stringify(idKeysArray));
      }
    }
  }

  private async init(urlOrClient: URL | string | RedisClient) {
    this.client = new RedisConnection(
      urlOrClient,
      this.options,
      this.options.sessionKeyPrefix,
    );
    await this.client.connect();
  }
}
