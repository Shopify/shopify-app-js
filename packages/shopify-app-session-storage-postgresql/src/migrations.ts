import {PostgresConnection} from './postgres-connection';

export const migrationMap = new Map([
  ['migrateToVersion1_0_1', migrateToVersion1_0_1],
]);

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateToVersion1_0_1(
  connection: PostgresConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE ${connection.sessionDBIdentifier} 
    ALTER COLUMN scope TYPE varchar(1024)`);

  return Promise.resolve();
}
