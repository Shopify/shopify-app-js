import {MySqlConnection} from './mysql-connection';

export const migrationMap = new Map([
  ['migrateScopeFieldToVarchar1024', migrateScopeFieldToVarchar1024],
]);

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateScopeFieldToVarchar1024(
  connection: MySqlConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE ${connection.sessionDBIdentifier} 
      MODIFY COLUMN scope varchar(1024)`);
}
