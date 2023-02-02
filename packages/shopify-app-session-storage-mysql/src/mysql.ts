import mysql from 'mysql2/promise';
import {Session} from '@shopify/shopify-api';
import {
  SessionStorage,
  SessionStorageMigratorOptions,
  SessionStorageMigrator,
  RdbmsSessionStorageMigrator,
  RdbmsSessionStorageOptions,
} from '@shopify/shopify-app-session-storage';

import {migrationMap} from './migrations';
import {MySqlEngine} from './mysql-engine';

export interface MySQLSessionStorageOptions
  extends RdbmsSessionStorageOptions {}

const defaultMySQLSessionStorageOptions: MySQLSessionStorageOptions = {
  sessionTableName: 'shopify_sessions',
  sqlArgumentPlaceholder: '?',
  migratorOptions: {
    migrationTableName: 'shopify_sessions_migrations',
    versionColumnName: 'version',
    migrations: migrationMap,
  },
};

export class MySQLSessionStorage implements SessionStorage {
  static withCredentials(
    host: string,
    dbName: string,
    username: string,
    password: string,
    opts: Partial<MySQLSessionStorageOptions>,
  ) {
    return new MySQLSessionStorage(
      new URL(
        `mysql://${encodeURIComponent(username)}:${encodeURIComponent(
          password,
        )}@${host}/${encodeURIComponent(dbName)}`,
      ),
      opts,
    );
  }

  public readonly ready: Promise<void>;
  private options: MySQLSessionStorageOptions;
  private connection: MySqlEngine;
  private migrator: SessionStorageMigrator | null;

  constructor(
    private dbUrl: URL,
    opts: Partial<MySQLSessionStorageOptions> = {},
  ) {
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultMySQLSessionStorageOptions, ...opts};
    this.ready = this.init();
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
      REPLACE INTO ${this.options.sessionTableName}
      (${entries.map(([key]) => key).join(', ')})
      VALUES (${entries
        .map(() => `${this.options.sqlArgumentPlaceholder}`)
        .join(', ')})
    `;
    await this.connection.query(
      query,
      entries.map(([_key, value]) => value),
    );
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;
    const query = `
      SELECT * FROM \`${this.options.sessionTableName}\`
      WHERE id = ${this.options.sqlArgumentPlaceholder};
    `;
    const [rows] = await this.connection.query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    const rawResult = rows[0] as any;
    return this.databaseRowToSession(rawResult);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id = ${this.options.sqlArgumentPlaceholder};
    `;
    await this.connection.query(query, [id]);
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id IN (${ids
        .map(() => `${this.options.sqlArgumentPlaceholder}`)
        .join(',')});
    `;
    await this.connection.query(query, ids);
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.sessionTableName}
      WHERE shop = ${this.options.sqlArgumentPlaceholder};
    `;
    const [rows] = await this.connection.query(query, [shop]);
    if (!Array.isArray(rows) || rows?.length === 0) return [];

    const results: Session[] = rows.map((row: any) => {
      return this.databaseRowToSession(row);
    });
    return results;
  }

  public async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }

  private async init() {
    this.connection = new MySqlEngine(
      await mysql.createConnection(this.dbUrl.toString()),
      this.options.sessionTableName,
      this.options.sqlArgumentPlaceholder,
    );
    await this.createTable();
  }

  private async createTable() {
    const hasSessionTable = await this.connection.hasTable(
      this.options.sessionTableName,
    );
    if (!hasSessionTable) {
      const query = `
        CREATE TABLE ${this.options.sessionTableName} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline tinyint NOT NULL,
          scope varchar(255),
          expires integer,
          onlineAccessInfo varchar(255),
          accessToken varchar(255)
        )
      `;
      await this.connection.query(query);
    }
  }

  private databaseRowToSession(row: any): Session {
    // convert seconds to milliseconds prior to creating Session object
    if (row.expires) row.expires *= 1000;
    return Session.fromPropertyArray(Object.entries(row));
  }

  private async initMigrator(
    migratorOptions?: SessionStorageMigratorOptions | null,
  ): Promise<void> {
    await this.ready;

    if (migratorOptions === null) {
      return Promise.resolve();
    } else {
      this.migrator = new RdbmsSessionStorageMigrator(
        this.connection,
        migratorOptions,
      );
      this.migrator?.validateMigrationMap(migrationMap);

      return this.migrator?.applyMigrations();
    }
  }
}
