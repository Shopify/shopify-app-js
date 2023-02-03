import {
  AbstractMigrationEngine,
  SessionStorageMigratorOptions,
} from '@shopify/shopify-app-session-storage';

import {RedisConnection} from './redis-connection';

export class RedisSessionStorageMigrator extends AbstractMigrationEngine<
  RedisConnection,
  SessionStorageMigratorOptions
> {
  constructor(
    dbConnection: RedisConnection,
    opts: Partial<SessionStorageMigratorOptions> = {},
  ) {
    // The name has already been decided whith the last migration
    opts.migrationDBIdentifier = 'migrations';
    super(dbConnection, opts);
  }

  async initMigrationPersistence(): Promise<void> {
    // nothing to do here
    return Promise.resolve();
  }

  async hasMigrationBeenApplied(migrationName: string): Promise<boolean> {
    const migrations = await this.getMigrationRecords();
    const found = migrations.get(migrationName) ?? false;

    return Promise.resolve(found);
  }

  async saveAppliedMigration(migrationName: string): Promise<void> {
    const migrations = await this.getMigrationRecords();
    migrations.set(migrationName, true);

    this.connection.setKey(
      this.options.migrationDBIdentifier,
      JSON.stringify(Object.fromEntries(migrations)),
    );

    return Promise.resolve();
  }

  private async getMigrationRecords(): Promise<Map<string, boolean>> {
    const migrationsRecord = await this.connection.query(
      this.options.migrationDBIdentifier,
    );
    let migrations: Map<string, boolean> = new Map();
    if (migrationsRecord) {
      migrations = new Map(Object.entries(JSON.parse(migrationsRecord)));
    }

    return Promise.resolve(migrations);
  }
}
