import pg from 'pg';
import {Session} from '@shopify/shopify-api';
import {
  SessionStorage,
  RdbmsSessionStorageOptions,
  RdbmsSessionStorageMigratorOptions,
} from '@shopify/shopify-app-session-storage';

import {migrationMap} from './migrations';
import {PostgresConnection} from './postgres-connection';
import {PostgresSessionStorageMigrator} from './postgres-migrator';

export interface PostgreSQLSessionStorageOptions
  extends RdbmsSessionStorageOptions {
  port: number;
}
const defaultPostgreSQLSessionStorageOptions: PostgreSQLSessionStorageOptions =
  {
    sessionTableName: 'shopify_sessions',
    port: 3211,
    migratorOptions: {
      migrationDBIdentifier: 'shopify_sessions_migrations',
      migrationNameColumnName: 'migration_name',
      migrations: migrationMap,
    },
  };

export class PostgreSQLSessionStorage implements SessionStorage {
  static withCredentials(
    host: string,
    dbName: string,
    username: string,
    password: string,
    opts: Partial<PostgreSQLSessionStorageOptions>,
  ) {
    return new PostgreSQLSessionStorage(
      new URL(
        `postgres://${encodeURIComponent(username)}:${encodeURIComponent(
          password,
        )}@${host}/${encodeURIComponent(dbName)}`,
      ),
      opts,
    );
  }

  public readonly ready: Promise<void>;
  private internalInit: Promise<void>;
  private options: PostgreSQLSessionStorageOptions;
  private client: PostgresConnection;
  private migrator: PostgresSessionStorageMigrator;

  constructor(
    private dbUrl: URL,
    opts: Partial<PostgreSQLSessionStorageOptions> = {},
  ) {
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultPostgreSQLSessionStorageOptions, ...opts};
    this.internalInit = this.init();
    this.ready = this.initMigrator(this.options.migratorOptions);
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    // Note milliseconds to seconds conversion for `expires` property
    const entries = session
      .toPropertyArray()
      .map(([key, value]) =>
        key === 'expires'
          ? [key, Math.floor((value as number) / 1000)]
          : [key, value],
      );
    const query = `
      INSERT INTO ${this.options.sessionDBIdentifier}
      (${entries.map(([key]) => key).join(', ')})
      VALUES (${entries
        .map((_, i) => `${this.client.getArgumentPlaceholder(i + 1)}`)
        .join(', ')})
      ON CONFLICT (id) DO UPDATE SET ${entries
        .map(([key]) => `${key} = Excluded.${key}`)
        .join(', ')};
    `;
    await this.client.query(
      query,
      entries.map(([_key, value]) => value),
    );
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;
    const query = `
      SELECT * FROM ${this.options.sessionDBIdentifier}
      WHERE id = ${this.client.getArgumentPlaceholder(1)};
    `;
    const rows = await this.client.query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    const rawResult = rows[0] as any;
    return this.databaseRowToSession(rawResult);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionDBIdentifier}
      WHERE id = ${this.client.getArgumentPlaceholder(1)};
    `;
    await this.client.query(query, [id]);
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionDBIdentifier}
      WHERE id IN (${ids
        .map((_, i) => `${this.client.getArgumentPlaceholder(i + 1)}`)
        .join(', ')});
    `;
    await this.client.query(query, ids);
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.sessionDBIdentifier}
      WHERE shop = ${this.client.getArgumentPlaceholder(1)};
    `;
    const rows = await this.client.query(query, [shop]);
    if (!Array.isArray(rows) || rows?.length === 0) return [];

    const results: Session[] = rows.map((row: any) => {
      return this.databaseRowToSession(row);
    });
    return results;
  }

  public disconnect(): Promise<void> {
    return this.client.disconnect();
  }

  private async init() {
    this.client = new PostgresConnection(
      new pg.Client({connectionString: this.dbUrl.toString()}),
      this.options.sessionDBIdentifier,
    );
    await this.connectClient();
    await this.createTable();
  }

  private async connectClient(): Promise<void> {
    await this.client.connect();
  }

  private async createTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS ${this.options.sessionDBIdentifier} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline boolean NOT NULL,
          scope varchar(255),
          expires integer,
          onlineAccessInfo varchar(255),
          accessToken varchar(255)
        )
      `;
    await this.client.query(query);
  }

  private databaseRowToSession(row: any): Session {
    // convert seconds to milliseconds prior to creating Session object
    if (row.expires) row.expires *= 1000;
    return Session.fromPropertyArray(Object.entries(row));
  }

  private async initMigrator(
    migratorOptions?: RdbmsSessionStorageMigratorOptions,
  ): Promise<void> {
    await this.internalInit;

    if (migratorOptions === null) {
      return Promise.resolve();
    } else {
      this.migrator = new PostgresSessionStorageMigrator(
        this.client,
        migratorOptions,
      );
      this.migrator.validateMigrationMap(migrationMap);

      return this.migrator.applyMigrations();
    }
  }
}
