import {
  MigrationFunction,
  SessionStorageMigrator,
  SessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
  InvalidMigrationConfigurationError,
} from './session-storage-migration';
import {DBConnection} from './db-connection';

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

    for (const [
      migrationName,
      migrationFunction,
    ] of this.getMigrationMap().entries()) {
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

  getMigrationMap(): Map<string, MigrationFunction> {
    return this.options.migrations;
  }

  validateMigrationMap(migrationMap: Map<string, MigrationFunction>) {
    if (this.options !== null)
      for (const key of migrationMap.keys()) {
        if (!this.options.migrations.has(key)) {
          throw new InvalidMigrationConfigurationError(
            "'Internal migrations are missing, add the 'migrationMap' from the 'migrations.ts' file",
          );
        }
      }
  }

  abstract initMigrationPersistence(): Promise<void>;
  abstract hasMigrationBeenApplied(migrationName: string): Promise<boolean>;
  abstract saveAppliedMigration(migrationName: string): Promise<void>;
}
