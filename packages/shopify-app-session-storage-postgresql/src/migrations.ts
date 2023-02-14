import {MigrationOperation} from '@shopify/shopify-app-session-storage';

import {PostgresConnection} from './postgres-connection';

export const migrationList = [
  new MigrationOperation(
    'migrateScopeFieldToVarchar1024',
    migrateScopeFieldToVarchar1024,
  ),
];

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateScopeFieldToVarchar1024(
  connection: PostgresConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE ${connection.sessionStorageIdentifier} 
    ALTER COLUMN scope TYPE varchar(1024)`);
}
