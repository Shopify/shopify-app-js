import {
  MigrationOperation,
  SessionStorageMigrator,
  SessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
  InvalidMigrationConfigurationError,
  DBConnection,
} from './types';

export abstract class AbstractMigrationEngine<
  ConnectionType extends DBConnection,
  MigratorOptionType extends SessionStorageMigratorOptions,
> implements SessionStorageMigrator
{
  protected options: SessionStorageMigratorOptions;
  protected connection: ConnectionType;
  protected ready: Promise<void>;

  constructor(db: ConnectionType, opts: Partial<MigratorOptionType> = {}) {
    this.options = {...defaultSessionStorageMigratorOptions, ...opts};
    this.connection = db;

    this.ready = this.initMigrationPersistence();
  }

  async applyMigrations(): Promise<void> {
    await this.ready;

    for (const {migrationName, migrationFunction} of this.getMigrationList()) {
      const migrationApplied = await this.hasMigrationBeenApplied(
        migrationName,
      );
      if (!migrationApplied) {
        await migrationFunction(this.connection);
        await this.saveAppliedMigration(migrationName);
      }
    }
    return Promise.resolve();
  }

  getMigrationList(): MigrationOperation[] {
    return this.options.migrations;
  }

  validateMigrationList(migrationList: MigrationOperation[]) {
    if (this.options !== null)
      for (const {migrationName} of migrationList) {
        let entryFound = false;

        for (const optionMigration of this.options.migrations) {
          if (migrationName === optionMigration.migrationName) {
            entryFound = true;
            break;
          }
        }
        if (!entryFound) {
          throw new InvalidMigrationConfigurationError(
            "'Internal migrations are missing, add the 'migrationList' from the 'migrations.ts' file",
          );
        }
      }
  }

  abstract initMigrationPersistence(): Promise<void>;
  abstract hasMigrationBeenApplied(migrationName: string): Promise<boolean>;
  abstract saveAppliedMigration(migrationName: string): Promise<void>;
}
