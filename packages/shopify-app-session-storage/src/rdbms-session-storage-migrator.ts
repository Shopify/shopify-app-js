import {AbstractMigrationEngine} from './abstract-migration-engine';
import {
  DBConnection,
  SessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
} from './session-storage-migration';

export class RdbmsSessionStorageMigrator extends AbstractMigrationEngine<DBConnection> {
  constructor(
    db: DBConnection,
    opts: Partial<SessionStorageMigratorOptions> = {},
  ) {
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
        ${this.options.versionColumnName} varchar(255) NOT NULL PRIMARY KEY
    );`;

    if (discardCreateTable) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        this.dbEngine
          .query(migration, [])
          .then((_: any) => {
            resolve();
          })
          .catch((reason: any) => {
            reject(reason);
          });
      });
    }
  }

  async hasVersionBeenApplied(versionName: string): Promise<boolean> {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.migrationTableName}
      WHERE ${this.options.versionColumnName} = 
        ${this.dbEngine.getArgumentPlaceholder(1)};
    `;

    return new Promise((resolve, reject) => {
      this.dbEngine
        .query(query, [versionName])
        .then((rows: any) => {
          resolve(rows.length === 1);
        })
        .catch((reason: any) => {
          reject(reason);
        });
    });
  }

  async saveAppliedVersion(versionName: string): Promise<void> {
    await this.ready;

    const insert = `
          INSERT INTO ${this.options.migrationTableName} (${
      this.options.versionColumnName
    })
          VALUES(${this.dbEngine.getArgumentPlaceholder(1)});
        `;

    return new Promise((resolve, reject) => {
      this.dbEngine
        .query(insert, [versionName])
        .then((_: any) => {
          resolve();
        })
        .catch((reason: any) => {
          reject(reason);
        });
    });
  }
}
