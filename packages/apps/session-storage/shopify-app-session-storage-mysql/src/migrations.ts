import {MigrationOperation} from '@shopify/shopify-app-session-storage';

import {MySqlConnection} from './mysql-connection';

export const migrationList = [
  new MigrationOperation(
    'migrateScopeFieldToVarchar1024',
    migrateScopeFieldToVarchar1024,
  ),
  new MigrationOperation('addRefreshTokenFields', addRefreshTokenFields),
  new MigrationOperation('addUserInfoColumns', addUserInfoColumns),
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

export async function addUserInfoColumns(
  connection: MySqlConnection,
): Promise<void> {
  // Check if the old onlineAccessInfo column exists (skips migration for new installs)
  const [rows] = await connection.query(
    `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_NAME = ? AND COLUMN_NAME = 'onlineAccessInfo' AND TABLE_SCHEMA = DATABASE()`,
    [connection.sessionStorageIdentifier],
  );
  // mysql2 returns COUNT as BigInt, use loose equality
  // eslint-disable-next-line eqeqeq
  if (!rows[0] || rows[0].cnt == 0) return;

  // MySQL DDL (ALTER TABLE) causes an implicit commit, so a single transaction cannot
  // give full atomicity here. Instead, each step is made idempotent so that a crash
  // mid-migration leaves the DB in a state that is safe to retry.

  // Step 1: Add new columns — skip if they already exist (handles a previous partial run).
  const [newColRows] = await connection.query(
    `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_NAME = ? AND COLUMN_NAME = 'userId' AND TABLE_SCHEMA = DATABASE()`,
    [connection.sessionStorageIdentifier],
  );
  // eslint-disable-next-line eqeqeq
  if (newColRows[0]?.cnt == 0) {
    await connection.query(`
      ALTER TABLE \`${connection.sessionStorageIdentifier}\`
        ADD COLUMN \`userId\` BIGINT,
        ADD COLUMN \`firstName\` varchar(255),
        ADD COLUMN \`lastName\` varchar(255),
        ADD COLUMN \`email\` varchar(255),
        ADD COLUMN \`accountOwner\` tinyint,
        ADD COLUMN \`locale\` varchar(255),
        ADD COLUMN \`collaborator\` tinyint,
        ADD COLUMN \`emailVerified\` tinyint
    `);
  }

  // Step 2: Preserve userId from the old onlineAccessInfo column (idempotent).
  await connection.query(`
    UPDATE \`${connection.sessionStorageIdentifier}\`
    SET \`userId\` = CAST(\`onlineAccessInfo\` AS UNSIGNED)
    WHERE \`onlineAccessInfo\` IS NOT NULL
  `);

  // Step 3: Drop the old column.
  await connection.query(`
    ALTER TABLE \`${connection.sessionStorageIdentifier}\`
      DROP COLUMN \`onlineAccessInfo\`
  `);
}

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateScopeFieldToVarchar1024(
  connection: MySqlConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE ${connection.sessionStorageIdentifier} 
      MODIFY COLUMN scope varchar(1024)`);
}
