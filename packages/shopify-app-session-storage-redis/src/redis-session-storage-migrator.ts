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
    const migrations = await this.getMigrationRecords();
    const found =
      migrations.has(versionName) && (migrations.get(versionName) || false);

    return Promise.resolve(found);
  }

  async saveAppliedVersion(versionName: string): Promise<void> {
    const migrations = await this.getMigrationRecords();
    migrations.set(versionName, true);

    const superClass = this as AbstractSessionStorageMigrator<RedisEngine>;

    superClass.dbEngine.setKey(
      superClass.options.migrationTableName,
      JSON.stringify(Object.fromEntries(migrations)),
    );

    return Promise.resolve();
  }

  private async getMigrationRecords(): Promise<Map<string, boolean>> {
    const superClass = this as AbstractSessionStorageMigrator<RedisEngine>;

    const migrationsRecord = await superClass.dbEngine.query(
      superClass.options.migrationTableName,
    );
    let migrations: Map<string, boolean> = new Map();
    if (migrationsRecord) {
      migrations = new Map(Object.entries(JSON.parse(migrationsRecord)));
    }

    return Promise.resolve(migrations);
  }
}
