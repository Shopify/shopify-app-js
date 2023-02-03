import {DBConnection} from './db-connection';

/**
 * Each migration 'version' will be define the following way.
 * Via a function that receive the engine in parameter.
 */
type MigrationFunction = (engine: DBConnection) => Promise<void>;

/**
 * Defines how database migration will be handled.
 */
interface SessionStorageMigrator {
  /**
   * Should ensure that the persistence 'table' is created if it does not exist yet.
   */
  initMigrationPersitance(): Promise<void>;

  /**
   *  returns true if the versionName as already been applied and
   * therefore the migrator should not apply it. if false,
   * the migrator will run the associated migration
   * @param versionName the unique version name to look for in the migration table
   */
  hasVersionBeenApplied(versionName: string): Promise<boolean>;

  /**
   * Will persist that this versionName has been applied in the migration table
   * @param versionName the version to persisited as applied
   */
  saveAppliedVersion(versionName: string): Promise<void>;

  /**
   * Return a map versionName and function that will perform
   * the actual migration
   */
  getMigrationMap(): Map<string, MigrationFunction>;

  /**
   * Will iterate over the map returned by #getMigrationMap,
   * for each entry call #hasVersionBeenApplied, if it returns false
   * it will execute execute the function and then call #saveAppliedVersion
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
class InvalidMigrationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Use to initialise session storage migrators
 */
interface SessionStorageMigratorOptions {
  migrationDBIdentifier: string;
  migrations: Map<string, MigrationFunction>;
}

const defaultSessionStorageMigratorOptions: SessionStorageMigratorOptions = {
  migrationDBIdentifier: 'shopify_sessions_migrations',
  migrations: new Map(),
};

interface RdbmsSessionStorageMigratorOptions
  extends SessionStorageMigratorOptions {
  versionColumnName: string;
}

const defaultRdbmsSessionStorageMigratorOptions: RdbmsSessionStorageMigratorOptions =
  {
    migrationDBIdentifier: 'shopify_sessions_migrations',
    versionColumnName: 'version',
    migrations: new Map(),
  };

export {
  SessionStorageMigrator,
  MigrationFunction,
  InvalidMigrationConfigurationError,
  SessionStorageMigratorOptions,
  RdbmsSessionStorageMigratorOptions,
  defaultSessionStorageMigratorOptions,
  defaultRdbmsSessionStorageMigratorOptions,
};
