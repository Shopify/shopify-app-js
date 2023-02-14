import {PostgresConnection} from './postgres-connection';

export const migrationMap = new Map([
  ['migrateScopeFieldToVarchar1024', migrateScopeFieldToVarchar1024],
]);

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateScopeFieldToVarchar1024(
  connection: PostgresConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE ${connection.sessionStorageIdentifier} 
    ALTER COLUMN scope TYPE varchar(1024)`);
}
