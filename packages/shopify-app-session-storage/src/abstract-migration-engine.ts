import {
  MigrationFunction,
  DBConnection,
  SessionStorageMigrator,
  SessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
  InvalidMigrationConfigurationError,
} from './session-storage-migration';

export abstract class AbstractMigrationEngine<
  ConnectionType extends DBConnection,
> implements SessionStorageMigrator
{
  protected options: SessionStorageMigratorOptions;
  protected connection: ConnectionType;
  protected ready: Promise<void>;

  constructor(
    db: ConnectionType,
    opts: Partial<SessionStorageMigratorOptions> = {},
  ) {
    this.options = {...defaultSessionStorageMigratorOptions, ...opts};
    this.connection = db;

    this.ready = this.initMigrationPersitance();
  }

  async applyMigrations(): Promise<void> {
    await this.ready;

    for (const entry of this.getMigrationMap().entries()) {
      const version = entry[0];
      const migrateFunction = entry[1];

      const versionApplied = await this.hasVersionBeenApplied(version);
      if (!versionApplied) {
        await migrateFunction(this.connection);
        await this.saveAppliedVersion(version);
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

  abstract initMigrationPersitance(): Promise<void>;
  abstract hasVersionBeenApplied(versionName: string): Promise<boolean>;
  abstract saveAppliedVersion(versionName: string): Promise<void>;
}
