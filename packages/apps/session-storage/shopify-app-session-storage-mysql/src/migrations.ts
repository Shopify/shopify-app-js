import {MigrationOperation} from '@shopify/shopify-app-session-storage';

import {MySqlConnection} from './mysql-connection';

export const migrationList = [
  new MigrationOperation(
    'migrateScopeFieldToVarchar1024',
    migrateScopeFieldToVarchar1024,
  ),
  new MigrationOperation('addRefreshTokenFields', addRefreshTokenFields),
];

export async function addRefreshTokenFields(
  connection: MySqlConnection,
): Promise<void> {
  const hasColumn = async (columnName: string): Promise<boolean> => {
    const [rows] = await connection.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`,
      [connection.sessionStorageIdentifier, columnName],
    );
    return Array.isArray(rows) && rows.length > 0;
  };

  if (!(await hasColumn('refreshToken'))) {
    await connection.query(
      `ALTER TABLE ${connection.sessionStorageIdentifier} ADD COLUMN refreshToken varchar(255)`,
    );
  }

  if (!(await hasColumn('refreshTokenExpires'))) {
    await connection.query(
      `ALTER TABLE ${connection.sessionStorageIdentifier} ADD COLUMN refreshTokenExpires integer`,
    );
  }
}

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateScopeFieldToVarchar1024(
  connection: MySqlConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE ${connection.sessionStorageIdentifier} 
      MODIFY COLUMN scope varchar(1024)`);
}
