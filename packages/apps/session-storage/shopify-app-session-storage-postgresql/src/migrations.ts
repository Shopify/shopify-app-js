import {MigrationOperation} from '@shopify/shopify-app-session-storage';

import {PostgresConnection} from './postgres-connection';

export const migrationList = [
  new MigrationOperation(
    'migrateScopeFieldToVarchar1024',
    migrateScopeFieldToVarchar1024,
  ),
  new MigrationOperation('migrateToCaseSensitivity', migrateToCaseSensitivity),
  new MigrationOperation('migrateToRefreshTokens', migrateToRefreshTokens),
  new MigrationOperation('addUserInfoColumns', addUserInfoColumns),
];

export async function addUserInfoColumns(
  connection: PostgresConnection,
): Promise<void> {
  // Check if the old onlineAccessInfo column exists (skips migration for new installs).
  // Use a case-insensitive match so this works whether or not migrateToCaseSensitivity
  // has already renamed onlineaccessinfo → onlineAccessInfo.
  const rows = await connection.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name = '${connection.sessionStorageIdentifier}' AND lower(column_name) = 'onlineaccessinfo'
  `);
  if (rows.length === 0) return;
  const oldColumn = rows[0].column_name as string;

  // Wrap in a transaction: PostgreSQL supports transactional DDL, so a mid-migration
  // failure will roll back cleanly and the migration will be retried on next startup.
  await connection.transaction([
    `ALTER TABLE "${connection.sessionStorageIdentifier}"
      ADD COLUMN "userId" bigint,
      ADD COLUMN "firstName" varchar(255),
      ADD COLUMN "lastName" varchar(255),
      ADD COLUMN "email" varchar(255),
      ADD COLUMN "accountOwner" boolean,
      ADD COLUMN "locale" varchar(255),
      ADD COLUMN "collaborator" boolean,
      ADD COLUMN "emailVerified" boolean`,
    `UPDATE "${connection.sessionStorageIdentifier}"
      SET "userId" = CAST("${oldColumn}" AS BIGINT)
      WHERE "${oldColumn}" IS NOT NULL`,
    `ALTER TABLE "${connection.sessionStorageIdentifier}"
      DROP COLUMN "${oldColumn}"`,
  ]);
}

// need change the size of the scope column from 255 to 1024 char
export async function migrateScopeFieldToVarchar1024(
  connection: PostgresConnection,
): Promise<void> {
  await connection.query(`ALTER TABLE "${connection.sessionStorageIdentifier}"
    ALTER COLUMN "scope" TYPE varchar(1024)`);
}

export async function migrateToCaseSensitivity(
  connection: PostgresConnection,
): Promise<void> {
  let queries: string[] = [];
  if (
    connection.sessionStorageIdentifier ===
    connection.sessionStorageIdentifier.toLowerCase()
  ) {
    // tablename is lowercase anyway, only need to rename the relevant columns (if not already renamed)
    const hasOldColumnsQuery = `
      SELECT EXISTS (
        SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name = '${connection.sessionStorageIdentifier}' AND column_name='isonline'
      )
    `;
    const rows = await connection.query(hasOldColumnsQuery);
    if (rows[0].exists) {
      queries = [
        `ALTER TABLE "${connection.sessionStorageIdentifier}" RENAME COLUMN "isonline" TO "isOnline"`,
        `ALTER TABLE "${connection.sessionStorageIdentifier}" RENAME COLUMN "accesstoken" TO "accessToken"`,
      ];
    }
  } else {
    // may need to migrate the data from the old table (if it exists) to the new one
    const hasOldSessionTable = await connection.hasTable(
      connection.sessionStorageIdentifier.toLowerCase(),
    );
    if (hasOldSessionTable) {
      queries = [
        // 1. copy the data from the old table to the new one, extracting userId from onlineaccessinfo
        `INSERT INTO "${connection.sessionStorageIdentifier}" (
          "id", "shop", "state", "isOnline", "scope", "expires", "accessToken", "userId"
        )
        SELECT id, shop, state, isonline, scope, expires, accesstoken,
          CASE WHEN onlineaccessinfo IS NOT NULL THEN CAST(onlineaccessinfo AS BIGINT) ELSE NULL END
        FROM "${connection.sessionStorageIdentifier.toLowerCase()}"`,
        // 2. drop the old table
        `DROP TABLE "${connection.sessionStorageIdentifier.toLowerCase()}"`,
      ];
    }
  }

  if (queries.length !== 0) {
    // wrap in a transaction
    queries.unshift(`BEGIN`);
    queries.push(`COMMIT`);

    await connection.transaction(queries);
  }
}

export async function migrateToRefreshTokens(
  connection: PostgresConnection,
): Promise<void> {
  const queries: string[] = [];

  const hasRefreshTokenColumn = `
    SELECT EXISTS (
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name = '${connection.sessionStorageIdentifier}' AND column_name='refreshToken'
    )
  `;
  const refreshTokenRows = await connection.query(hasRefreshTokenColumn);
  if (!refreshTokenRows[0].exists) {
    queries.push(
      `ALTER TABLE "${connection.sessionStorageIdentifier}" ADD COLUMN "refreshToken" varchar(255)`,
    );
  }

  const hasRefreshTokenExpiresColumn = `
    SELECT EXISTS (
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name = '${connection.sessionStorageIdentifier}' AND column_name='refreshTokenExpires'
    )
  `;
  const refreshTokenExpiresRows = await connection.query(
    hasRefreshTokenExpiresColumn,
  );
  if (!refreshTokenExpiresRows[0].exists) {
    queries.push(
      `ALTER TABLE "${connection.sessionStorageIdentifier}" ADD COLUMN "refreshTokenExpires" bigint`,
    );
  }

  if (queries.length !== 0) {
    queries.unshift(`BEGIN`);
    queries.push(`COMMIT`);

    await connection.transaction(queries);
  }
}
