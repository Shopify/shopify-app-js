import {DBConnection} from './db-connection';

/**
 * Each migration 'migration_name' will be define the following way.
 * Via a function that receive the engine in parameter.
 */
export type MigrationFunction = (engine: DBConnection) => Promise<void>;

/**
 * Defines how database migration will be handled.
 */
export interface SessionStorageMigrator {
  /**
   * Should ensure that the persistence 'table' is created if it does not exist yet.
   */
  initMigrationPersistence(): Promise<void>;

  /**
   *  returns true if the migrationName as already been applied and
   * therefore the migrator should not apply it. if false,
   * the migrator will run the associated migration
   * @param migrationName the unique version name to look for in the migration table
   */
  hasMigrationBeenApplied(migrationName: string): Promise<boolean>;

  /**
   * Will persist that this migrationName has been applied in the migration table
   * @param migrationName the version to persisited as applied
   */
  saveAppliedMigration(migrationName: string): Promise<void>;

  /**
   * Return a map migrationName and function that will perform
   * the actual migration
   */
  getMigrationMap(): Map<string, MigrationFunction>;

  /**
   * Will iterate over the map returned by #getMigrationMap,
   * for each entry call #hasMigrationBeenApplied, if it returns false
   * it will execute execute the function and then call #saveAppliedMigration
   */
  applyMigrations(): Promise<void>;

  /**
   * We want to ensure that user did not forget to includes our internal migrations with theirs.
   * We only check the key and not the value to allow users to customize even how to run
   * our internal migrations with theirs if they wish to.
   * E.g. they could override the key for a given version and having the function calling
   * their migration and then ours.
   * @param migrationMap - the map that contains the internal migrations to run
   */
  validateMigrationMap(migrationMap: Map<string, MigrationFunction>): void;
}

/**
 * When the configuration for migration is not consistent
 */
export class InvalidMigrationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Use to initialise session storage migrators
 */
export interface SessionStorageMigratorOptions {
  migrationDBIdentifier: string;
  migrations: Map<string, MigrationFunction>;
}

export const defaultSessionStorageMigratorOptions: SessionStorageMigratorOptions =
  {
    migrationDBIdentifier: 'shopify_sessions_migrations',
    migrations: new Map(),
  };

export interface RdbmsSessionStorageMigratorOptions
  extends SessionStorageMigratorOptions {
  migrationNameColumnName: string;
}

export const defaultRdbmsSessionStorageMigratorOptions: RdbmsSessionStorageMigratorOptions =
  {
    migrationDBIdentifier: 'shopify_sessions_migrations',
    migrationNameColumnName: 'migration_name',
    migrations: new Map(),
  };
