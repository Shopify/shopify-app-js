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
  // Check if columns already exist before attempting to add them
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME IN ('refreshToken', 'refreshTokenExpires')`,
    [connection.sessionStorageIdentifier],
  );

  // If either column exists, skip migration (assume both exist or will be added together)
  if (Array.isArray(rows) && rows.length > 0) {
    return;
  }

  // Add both columns
  await connection.query(`ALTER TABLE ${connection.sessionStorageIdentifier}
    ADD COLUMN refreshToken text,
    ADD COLUMN refreshTokenExpires integer`);
}

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateScopeFieldToVarchar1024(
  connection: MySqlConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE ${connection.sessionStorageIdentifier} 
      MODIFY COLUMN scope varchar(1024)`);
}
