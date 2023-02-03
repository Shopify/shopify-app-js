import sqlite3 from 'sqlite3';
import {Session} from '@shopify/shopify-api';
import {
  SessionStorage,
  SessionStorageMigrator,
  RdbmsSessionStorageMigrator,
  RdbmsSessionStorageOptions,
  RdbmsSessionStorageMigratorOptions,
} from '@shopify/shopify-app-session-storage';

import {SqliteConnection} from './sqlite-connection';
import {migrationMap} from './migrations';

export interface SQLiteSessionStorageOptions
  extends RdbmsSessionStorageOptions {}

const defaultSQLiteSessionStorageOptions: SQLiteSessionStorageOptions = {
  sessionDBIdentifier: 'shopify_sessions',
  sqlArgumentPlaceholder: '?',
  migratorOptions: {
    migrationDBIdentifier: 'shopify_sessions_migrations',
    versionColumnName: 'version',
    migrations: migrationMap,
  },
};

export class SQLiteSessionStorage implements SessionStorage {
  private options: SQLiteSessionStorageOptions;
  private db: SqliteConnection;
  private ready: Promise<void>;
  private internalInit: Promise<void>;
  private migrator: SessionStorageMigrator | null;

  constructor(
    private filename: string,
    opts: Partial<SQLiteSessionStorageOptions> = {},
  ) {
    this.options = {...defaultSQLiteSessionStorageOptions, ...opts};
    this.db = new SqliteConnection(
      new sqlite3.Database(this.filename),
      this.options.sessionDBIdentifier,
      this.options.sqlArgumentPlaceholder,
    );
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
      INSERT OR REPLACE INTO ${this.options.sessionDBIdentifier}
      (${entries.map(([key]) => key).join(', ')})
      VALUES (${entries
        .map(() => `${this.options.sqlArgumentPlaceholder}`)
        .join(', ')});
    `;

    await this.db.query(
      query,
      entries.map(([_key, value]) => value),
    );
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;
    const query = `
      SELECT * FROM ${this.options.sessionDBIdentifier}
      WHERE id = ${this.options.sqlArgumentPlaceholder};
    `;
    const rows = await this.db.query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    const rawResult = rows[0] as any;
    return this.databaseRowToSession(rawResult);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionDBIdentifier}
      WHERE id = ${this.options.sqlArgumentPlaceholder};
    `;
    await this.db.query(query, [id]);
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionDBIdentifier}
      WHERE id IN (${ids
        .map(() => `${this.options.sqlArgumentPlaceholder}`)
        .join(',')});
    `;
    await this.db.query(query, ids);
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;
    const query = `
      SELECT * FROM ${this.options.sessionDBIdentifier}
      WHERE shop = ${this.options.sqlArgumentPlaceholder};
    `;
    const rows = await this.db.query(query, [shop]);
    if (!Array.isArray(rows) || rows?.length === 0) return [];

    const results: Session[] = rows.map((row: any) => {
      return this.databaseRowToSession(row);
    });
    return results;
  }

  private async init() {
    const hasSessionTable = await this.db.hasTable(
      this.options.sessionDBIdentifier,
    );
    if (!hasSessionTable) {
      const query = `
        CREATE TABLE ${this.options.sessionDBIdentifier} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline integer NOT NULL,
          expires integer,
          scope varchar(1024), -- sqlite allows more than this limit without failing
          accessToken varchar(255),
          onlineAccessInfo varchar(255)
        );
      `;
      await this.db.query(query);
    }
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
      this.migrator = new RdbmsSessionStorageMigrator(this.db, migratorOptions);
      this.migrator.validateMigrationMap(migrationMap);

      return this.migrator.applyMigrations();
    }
  }
}
