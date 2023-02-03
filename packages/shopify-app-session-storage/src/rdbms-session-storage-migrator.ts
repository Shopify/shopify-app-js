import {AbstractMigrationEngine} from './abstract-migration-engine';
import {
  RdbmsSessionStorageMigratorOptions,
  defaultRdbmsSessionStorageMigratorOptions,
} from './session-storage-migration';
import {RdbmsConnection} from './db-connection';

export class RdbmsSessionStorageMigrator extends AbstractMigrationEngine<
  RdbmsConnection,
  RdbmsSessionStorageMigratorOptions
> {
  constructor(
    dbConnection: RdbmsConnection,
    opts: Partial<RdbmsSessionStorageMigratorOptions> = {},
  ) {
    super(dbConnection, {
      ...defaultRdbmsSessionStorageMigratorOptions,
      ...opts,
    });
  }

  async initMigrationPersitance(): Promise<void> {
    let ifNotExist = '';
    let discardCreateTable = false;

    if (this.connection.useHasTable) {
      discardCreateTable = await this.connection.hasTable(
        this.options.migrationDBIdentifier,
      );
    } else {
      ifNotExist = 'IF NOT EXISTS';
    }

    const migration = `
      CREATE TABLE ${ifNotExist} ${this.options.migrationDBIdentifier} (
        ${this.getOptions().versionColumnName} varchar(255) NOT NULL PRIMARY KEY
    );`;

    if (discardCreateTable) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        this.connection
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
      SELECT * FROM ${this.options.migrationDBIdentifier}
      WHERE ${this.getOptions().versionColumnName} = 
        ${this.connection.getArgumentPlaceholder(1)};
    `;

    return new Promise((resolve, reject) => {
      this.connection
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
          INSERT INTO ${this.options.migrationDBIdentifier} (${
      this.getOptions().versionColumnName
    })
          VALUES(${this.connection.getArgumentPlaceholder(1)});
        `;

    return new Promise((resolve, reject) => {
      this.connection
        .query(insert, [versionName])
        .then((_: any) => {
          resolve();
        })
        .catch((reason: any) => {
          reject(reason);
        });
    });
  }

  private getOptions(): RdbmsSessionStorageMigratorOptions {
    return this.options as RdbmsSessionStorageMigratorOptions;
  }
}
