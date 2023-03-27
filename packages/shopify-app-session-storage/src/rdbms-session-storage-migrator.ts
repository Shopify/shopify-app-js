import {AbstractMigrationEngine} from './abstract-migration-engine';
import {
  RdbmsSessionStorageMigratorOptions,
  defaultRdbmsSessionStorageMigratorOptions,
  RdbmsConnection,
  MigrationOperation,
} from './types';

export abstract class RdbmsSessionStorageMigrator extends AbstractMigrationEngine<
  RdbmsConnection,
  RdbmsSessionStorageMigratorOptions
> {
  constructor(
    dbConnection: RdbmsConnection,
    opts: Partial<RdbmsSessionStorageMigratorOptions> = {},
    migrations: MigrationOperation[],
  ) {
    super(
      dbConnection,
      {
        ...defaultRdbmsSessionStorageMigratorOptions,
        ...opts,
      },
      migrations,
    );
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

  public getOptions(): RdbmsSessionStorageMigratorOptions {
    return this.options as RdbmsSessionStorageMigratorOptions;
  }

  abstract initMigrationPersistence(): Promise<void>;
}
