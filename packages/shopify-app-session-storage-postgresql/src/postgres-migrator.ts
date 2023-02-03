import {
  RdbmsSessionStorageMigrator,
  RdbmsSessionStorageMigratorOptions,
} from '@shopify/shopify-app-session-storage';

import {PostgresConnection} from './postgres-connection';

export class PostgresSessionStorageMigrator extends RdbmsSessionStorageMigrator {
  constructor(
    dbConnection: PostgresConnection,
    opts: Partial<RdbmsSessionStorageMigratorOptions> = {},
  ) {
    super(dbConnection, opts);
  }

  async initMigrationPersistence(): Promise<void> {
    const migration = `
      CREATE TABLE IF NOT EXISTS ${this.options.migrationDBIdentifier} (
        ${
          this.getOptions().migrationNameColumnName
        } varchar(255) NOT NULL PRIMARY KEY
    );`;
    await this.connection.query(migration, []);
  }
}
