import {AbstractSessionStorageMigrator} from './abstract-session-storage-migrator';
import {
  MigrationFunction,
  DBEngine,
  SessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
} from './session-storage-migration';

export class RdbmsSessionStorageMigrator extends AbstractSessionStorageMigrator<DBEngine> {
  constructor(db: DBEngine, opts: Partial<SessionStorageMigratorOptions> = {}) {
    super(db, {...defaultSessionStorageMigratorOptions, ...opts});
  }

  async initMigrationPersitance(): Promise<void> {
    await this.ready;

    const migration = `
      CREATE TABLE IF NOT EXISTS ${this.options.migrationTableName} (
        version varchar(255) NOT NULL PRIMARY KEY
      );
    `;

    await this.dbEngine.query(migration, []);
    return Promise.resolve();
  }

  async hasVersionBeenApplied(versionName: string): Promise<boolean> {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.migrationTableName}
      WHERE version = ?;
    `;
    const rows = await this.dbEngine.query(query, [versionName]);

    return Promise.resolve(rows.length === 1);
  }

  async saveAppliedVersion(versionName: string): Promise<void> {
    await this.ready;

    const insert = `
          INSERT INTO ${this.options.migrationTableName} (version)
          VALUES(?);
        `;
    await this.dbEngine.query(insert, [versionName]);
    return Promise.resolve();
  }
}
