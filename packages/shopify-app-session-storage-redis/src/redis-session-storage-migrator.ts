import {
  AbstractSessionStorageMigrator,
  SessionStorageMigratorOptions,
} from '@shopify/shopify-app-session-storage';

import {RedisEngine} from './redis-engine';

export class RedisSessionStorageMigrator extends AbstractSessionStorageMigrator<RedisEngine> {
  constructor(
    db: RedisEngine,
    opts: Partial<SessionStorageMigratorOptions> = {},
  ) {
    // The name has already been decided whith the last migration
    opts.migrationTableName = 'migrations';
    super(db, opts);
  }

  async initMigrationPersitance(): Promise<void> {
    // nothing to do here
    return Promise.resolve();
  }

  async hasVersionBeenApplied(versionName: string): Promise<boolean> {
    await this.ready;

    const migrations = await this.getMigrationRecords();
    const found =
      migrations.has(versionName) && (migrations.get(versionName) || false);

    return Promise.resolve(found);
  }

  async saveAppliedVersion(versionName: string): Promise<void> {
    await this.ready;

    const migrations = await this.getMigrationRecords();
    migrations.set(versionName, true);

    this.dbEngine.setKey(
      this.options.migrationTableName,
      JSON.stringify(Object.fromEntries(migrations)),
    );

    return Promise.resolve();
  }

  private async getMigrationRecords(): Promise<Map<string, boolean>> {
    const migrationsRecord = await this.dbEngine.query(
      this.options.migrationTableName,
    );
    let migrations: Map<string, boolean> = new Map();
    if (migrationsRecord) {
      migrations = new Map(Object.entries(JSON.parse(migrationsRecord)));
    }

    return Promise.resolve(migrations);
  }
}
