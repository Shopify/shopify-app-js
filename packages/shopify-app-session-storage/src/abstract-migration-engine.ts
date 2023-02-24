import {
  MigrationOperation,
  SessionStorageMigrator,
  SessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
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
  protected migrations: MigrationOperation[];

  constructor(
    db: ConnectionType,
    opts: Partial<MigratorOptionType> = {},
    migrations: MigrationOperation[],
  ) {
    this.options = {...defaultSessionStorageMigratorOptions, ...opts};
    this.connection = db;
    this.migrations = migrations;

    this.ready = this.initMigrationPersistence();
  }

  async applyMigrations(databaseReady: Promise<void>): Promise<void> {
    await databaseReady;
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
    return this.migrations;
  }

  // validateMigrationList(migrationList: MigrationOperation[]) {
  //   if (this.options !== null)
  //     for (const {migrationName} of migrationList) {
  //       let entryFound = false;

  //       for (const optionMigration of this.getMigrationList()) {
  //         if (migrationName === optionMigration.migrationName) {
  //           entryFound = true;
  //           break;
  //         }
  //       }
  //       if (!entryFound) {
  //         throw new InvalidMigrationConfigurationError(
  //           "'Internal migrations are missing, add the 'migrationList' from the 'migrations.ts' file",
  //         );
  //       }
  //     }
  // }

  abstract initMigrationPersistence(): Promise<void>;
  abstract hasMigrationBeenApplied(migrationName: string): Promise<boolean>;
  abstract saveAppliedMigration(migrationName: string): Promise<void>;
}
