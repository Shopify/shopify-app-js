import {AbstractMigrationEngine} from './abstract-migration-engine';
import {
  RdbmsSessionStorageMigratorOptions,
  defaultRdbmsSessionStorageMigratorOptions,
  RdbmsConnection,
} from './types';

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

  async initMigrationPersistence(): Promise<void> {
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
        ${
          this.getOptions().migrationNameColumnName
        } varchar(255) NOT NULL PRIMARY KEY
    );`;

    if (!discardCreateTable) {
      await this.connection.query(migration, []);
    }
  }

  async hasMigrationBeenApplied(migrationName: string): Promise<boolean> {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.migrationDBIdentifier}
      WHERE ${this.getOptions().migrationNameColumnName} = 
        ${this.connection.getArgumentPlaceholder(1)};
    `;

    const rows = await this.connection.query(query, [migrationName]);
    return rows.length === 1;
  }

  async saveAppliedMigration(migrationName: string): Promise<void> {
    await this.ready;

    const insert = `
          INSERT INTO ${this.options.migrationDBIdentifier} (${
      this.getOptions().migrationNameColumnName
    })
          VALUES(${this.connection.getArgumentPlaceholder(1)});
        `;

    await this.connection.query(insert, [migrationName]);
  }

  private getOptions(): RdbmsSessionStorageMigratorOptions {
    return this.options as RdbmsSessionStorageMigratorOptions;
  }
}
