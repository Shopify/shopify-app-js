import {AbstractSessionStorageMigrator} from './abstract-session-storage-migrator';
import {
  DBEngine,
  SessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
} from './session-storage-migration';

export class RdbmsSessionStorageMigrator extends AbstractSessionStorageMigrator<DBEngine> {
  constructor(db: DBEngine, opts: Partial<SessionStorageMigratorOptions> = {}) {
    super(db, {...defaultSessionStorageMigratorOptions, ...opts});
  }

  async initMigrationPersitance(): Promise<void> {
    let ifNotExist = '';
    let discardCreateTable = false;

    if (this.dbEngine.useHasTable) {
      discardCreateTable = await this.dbEngine.hasTable(
        this.options.migrationTableName,
      );
    } else {
      ifNotExist = 'IF NOT EXISTS';
    }

    const migration = `
      CREATE TABLE ${ifNotExist} ${this.options.migrationTableName} (
        version varchar(255) NOT NULL PRIMARY KEY
    );`;

    let result: Promise<void> = Promise.reject();
    if (!discardCreateTable) {
      await this.dbEngine
        .query(migration, [])
        .catch((reason: any) => {
          console.log(`Error while initialising migration table: ${reason}`);
          result = Promise.reject();
        })
        .then((_: any) => {
          result = Promise.resolve();
        });
    }

    return result;
  }

  async hasVersionBeenApplied(versionName: string): Promise<boolean> {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.migrationTableName}
      WHERE version = ${this.dbEngine.getArgumentPlaceholder(1)};
    `;
    const rows = await this.dbEngine.query(query, [versionName]);

    return Promise.resolve(rows.length === 1);
  }

  async saveAppliedVersion(versionName: string): Promise<void> {
    await this.ready;

    const insert = `
          INSERT INTO ${this.options.migrationTableName} (version)
          VALUES(${this.dbEngine.getArgumentPlaceholder(1)});
        `;
    await this.dbEngine.query(insert, [versionName]);
    return Promise.resolve();
  }
}
