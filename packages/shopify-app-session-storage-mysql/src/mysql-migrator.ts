import {
  RdbmsSessionStorageMigrator,
  RdbmsSessionStorageMigratorOptions,
} from '@shopify/shopify-app-session-storage';

import {MySqlConnection} from './mysql-connection';

export class MySqlSessionStorageMigrator extends RdbmsSessionStorageMigrator {
  constructor(
    dbConnection: MySqlConnection,
    opts: Partial<RdbmsSessionStorageMigratorOptions> = {},
  ) {
    super(dbConnection, opts);
  }

  async initMigrationPersistence(): Promise<void> {
    const discardCreateTable = await this.connection.hasTable(
      this.options.migrationDBIdentifier,
    );

    if (!discardCreateTable) {
      const migration = `
      CREATE TABLE ${this.options.migrationDBIdentifier} (
        ${
          this.getOptions().migrationNameColumnName
        } varchar(255) NOT NULL PRIMARY KEY
    );`;

      await this.connection.query(migration, []);
    }
  }
}
