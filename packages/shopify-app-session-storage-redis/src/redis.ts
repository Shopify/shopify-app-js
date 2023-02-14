import {RedisClientOptions} from 'redis';
import {Session} from '@shopify/shopify-api';
import {
  SessionStorage,
  SessionStorageMigratorOptions,
  SessionStorageMigrator,
} from '@shopify/shopify-app-session-storage';

import {migrationList} from './migrations';
import {RedisConnection} from './redis-connection';
import {RedisSessionStorageMigrator} from './redis-migrator';

export interface RedisSessionStorageOptions extends RedisClientOptions {
  sessionKeyPrefix: string;
  onError?: (...args: any[]) => void;
  migratorOptions?: SessionStorageMigratorOptions;
}
const defaultRedisSessionStorageOptions: RedisSessionStorageOptions = {
  sessionKeyPrefix: 'shopify_sessions',
  migratorOptions: {
    migrationDBIdentifier: 'migrations',
    migrations: migrationList,
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

  constructor(dbUrl: URL, opts: Partial<RedisSessionStorageOptions> = {}) {
    this.options = {...defaultRedisSessionStorageOptions, ...opts};
    this.internalInit = this.init(dbUrl.toString());
    this.ready = this.initMigrator(this.options.migratorOptions);
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    await this.client.set(
      session.id,
      JSON.stringify(session.toPropertyArray()),
    );
    await this.addKeyToShopList(session);
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;

    let rawResult: any = await this.client.get(id);

    if (!rawResult) return undefined;
    rawResult = JSON.parse(rawResult);

    return Session.fromPropertyArray(rawResult);
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

  private async init(dbUrl: string) {
    this.client = new RedisConnection(
      dbUrl,
      this.options,
      this.options.sessionKeyPrefix,
    );
    await this.client.connect();
  }

  private async initMigrator(
    migratorOptions?: SessionStorageMigratorOptions,
  ): Promise<void> {
    await this.internalInit;

    if (migratorOptions === null) {
      return Promise.resolve();
    } else {
      this.migrator = new RedisSessionStorageMigrator(
        this.client,
        migratorOptions,
      );
      this.migrator.validateMigrationList(migrationList);

      return this.migrator.applyMigrations();
    }
  }
}
