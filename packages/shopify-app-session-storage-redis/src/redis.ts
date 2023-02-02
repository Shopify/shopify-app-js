import {createClient, RedisClientOptions} from 'redis';
import {Session} from '@shopify/shopify-api';
import {
  SessionStorage,
  SessionStorageMigratorOptions,
  SessionStorageMigrator,
} from '@shopify/shopify-app-session-storage';

import {migrationMap} from './migrations';
import {RedisEngine} from './redis-engine';
import {RedisSessionStorageMigrator} from './redis-session-storage-migrator';

export interface RedisSessionStorageOptions extends RedisClientOptions {
  sessionKeyPrefix: string;
  onError?: (...args: any[]) => void;
  migratorOptions: SessionStorageMigratorOptions | null;
}
const defaultRedisSessionStorageOptions: RedisSessionStorageOptions = {
  sessionKeyPrefix: 'shopify_sessions',
  migratorOptions: {
    migrationTableName: 'migrations',
    versionColumnName: '',
    migrations: migrationMap,
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
  private client: RedisEngine;
  private migrator: SessionStorageMigrator | null;

  constructor(
    private dbUrl: URL,
    opts: Partial<RedisSessionStorageOptions> = {},
  ) {
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultRedisSessionStorageOptions, ...opts};
    this.internalInit = this.init();
    this.ready = this.initMigrator(this.options.migratorOptions);
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    await this.client.setKey(
      session.id,
      JSON.stringify(session.toPropertyArray()),
    );
    await this.addKeyToShopList(session);
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;

    let rawResult: any = await this.client.query(id);

    if (!rawResult) return undefined;
    rawResult = JSON.parse(rawResult);

    return Session.fromPropertyArray(rawResult);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;
    const session = await this.loadSession(id);
    if (session) {
      await this.removeKeyFromShopList(session.shop, id);
      await this.client.delete(id);
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

    const idKeysArrayString = await this.client.query(shop);
    if (!idKeysArrayString) return [];

    const idKeysArray = JSON.parse(idKeysArrayString);
    const results: Session[] = [];
    for (const idKey of idKeysArray) {
      const rawResult = await this.client.getWithoutFullKey(idKey);
      if (!rawResult) continue;

      const session = Session.fromPropertyArray(JSON.parse(rawResult));
      results.push(session);
    }

    return results;
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  private async addKeyToShopList(session: Session) {
    const shopKey = session.shop;
    const idKey = this.client.fullKey(session.id);
    const idKeysArrayString = await this.client.query(shopKey);

    if (idKeysArrayString) {
      const idKeysArray = JSON.parse(idKeysArrayString);

      if (!idKeysArray.includes(idKey)) {
        idKeysArray.push(idKey);
        await this.client.setKey(shopKey, JSON.stringify(idKeysArray));
      }
    } else {
      await this.client.setKey(shopKey, JSON.stringify([idKey]));
    }
  }

  private async removeKeyFromShopList(shop: string, id: string) {
    const shopKey = shop;
    const idKey = this.client.fullKey(id);
    const idKeysArrayString = await this.client.query(shopKey);

    if (idKeysArrayString) {
      const idKeysArray = JSON.parse(idKeysArrayString);
      const index = idKeysArray.indexOf(idKey);

      if (index > -1) {
        idKeysArray.splice(index, 1);
        await this.client.setKey(shopKey, JSON.stringify(idKeysArray));
      }
    }
  }

  private async init() {
    const client = createClient({
      ...this.options,
      url: this.dbUrl.toString(),
    });

    this.client = new RedisEngine(client, this.options.sessionKeyPrefix);

    await this.client.connect();
  }

  private async initMigrator(
    migratorOptions?: SessionStorageMigratorOptions | null,
  ): Promise<void> {
    await this.internalInit;

    if (migratorOptions === null) {
      return Promise.resolve();
    } else {
      this.migrator = new RedisSessionStorageMigrator(
        this.client,
        migratorOptions,
      );
      this.migrator?.validateMigrationMap(migrationMap);

      return this.migrator?.applyMigrations();
    }
  }
}
