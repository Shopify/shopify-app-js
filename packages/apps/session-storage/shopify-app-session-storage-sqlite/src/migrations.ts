import {MigrationOperation} from '@shopify/shopify-app-session-storage';

import {SqliteConnection} from './sqlite-connection';

export const migrationList = [
  new MigrationOperation(
    'migrateScopeFieldToVarchar1024',
    migrateScopeFieldToVarchar1024,
  ),
  new MigrationOperation('addRefreshTokenFields', addRefreshTokenFields),
  new MigrationOperation('addUserInfoColumns', addUserInfoColumns),
];

async function addUserInfoColumns(connection: SqliteConnection): Promise<void> {
  // Check if the old onlineAccessInfo column exists (skips migration for new installs)
  const rows = await connection.query(
    `SELECT COUNT(*) as cnt FROM pragma_table_info('${connection.sessionStorageIdentifier}') WHERE name='onlineAccessInfo'`,
  );
  if (!rows[0] || rows[0].cnt === 0) return;

  const tempTableName = `${connection.sessionStorageIdentifier}_for_addUserInfoColumns`;

  await connection.executeRawQuery('BEGIN');

  // 1. rename existing table
  await connection.query(
    `ALTER TABLE ${connection.sessionStorageIdentifier} RENAME TO ${tempTableName};`,
  );

  // 2. create new table with individual user info columns (preserving refresh token fields)
  await connection.query(`
    CREATE TABLE ${connection.sessionStorageIdentifier} (
      id varchar(255) NOT NULL PRIMARY KEY,
      shop varchar(255) NOT NULL,
      state varchar(255) NOT NULL,
      isOnline integer NOT NULL,
      expires integer,
      scope varchar(1024),
      accessToken varchar(255),
      userId integer,
      firstName varchar(255),
      lastName varchar(255),
      email varchar(255),
      accountOwner integer,
      locale varchar(255),
      collaborator integer,
      emailVerified integer,
      refreshToken varchar(255),
      refreshTokenExpires integer
    );
  `);

  // 3. copy data, converting onlineAccessInfo -> userId, preserving refresh token fields
  await connection.query(`
    INSERT INTO ${connection.sessionStorageIdentifier} (id, shop, state, isOnline, expires, scope, accessToken, userId, refreshToken, refreshTokenExpires)
      SELECT id, shop, state, isOnline, expires, scope, accessToken,
        CASE WHEN onlineAccessInfo IS NOT NULL THEN CAST(onlineAccessInfo AS INTEGER) ELSE NULL END,
        refreshToken, refreshTokenExpires
      FROM ${tempTableName};
  `);

  // 4. drop old table
  await connection.query(`DROP TABLE ${tempTableName};`);

  await connection.executeRawQuery('COMMIT');
}

// need to migrate exisiting scope from varchar 255 to varchar 1024
async function migrateScopeFieldToVarchar1024(
  connection: SqliteConnection,
): Promise<void> {
  const tempTableName = `${connection.sessionStorageIdentifier}_for_migrateScopeFieldToVarchar1024`;

  await connection.executeRawQuery('BEGIN');

  //  1. rename exisiting table
  const rename = `
    ALTER TABLE ${connection.sessionStorageIdentifier} RENAME TO ${tempTableName};
  `;
  await connection.query(rename);

  // 2. Create new table with 1024 chars
  const newTable = `
        CREATE TABLE ${connection.sessionStorageIdentifier} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline integer NOT NULL,
          expires integer,
          scope varchar(1024),
          accessToken varchar(255),
          onlineAccessInfo varchar(255)
        );
      `;
  await connection.query(newTable);

  // 3. copy all content from old table into new table
  const insert = `
    INSERT INTO ${connection.sessionStorageIdentifier} (id,shop,state,isOnline,expires,scope,accessToken,onlineAccessInfo)
      SELECT id,shop,state,isOnline,expires,scope,accessToken,onlineAccessInfo
      FROM ${tempTableName};
  `;
  await connection.query(insert);

  // 4. Delete old renamed table
  const drop = `DROP TABLE ${tempTableName};`;
  await connection.query(drop);

  await connection.executeRawQuery('COMMIT');
}

// Add refresh token and refresh token expiration fields
async function addRefreshTokenFields(
  connection: SqliteConnection,
): Promise<void> {
  const tempTableName = `${connection.sessionStorageIdentifier}_for_addRefreshTokenFields`;

  await connection.executeRawQuery('BEGIN');

  // 1. Rename existing table
  const rename = `
    ALTER TABLE ${connection.sessionStorageIdentifier} RENAME TO ${tempTableName};
  `;
  await connection.query(rename);

  // 2. Create new table with refresh token fields
  const newTable = `
    CREATE TABLE ${connection.sessionStorageIdentifier} (
      id varchar(255) NOT NULL PRIMARY KEY,
      shop varchar(255) NOT NULL,
      state varchar(255) NOT NULL,
      isOnline integer NOT NULL,
      expires integer,
      scope varchar(1024),
      accessToken varchar(255),
      onlineAccessInfo varchar(255),
      refreshToken varchar(255),
      refreshTokenExpires integer
    );
  `;
  await connection.query(newTable);

  // 3. Copy all content from old table into new table
  const insert = `
    INSERT INTO ${connection.sessionStorageIdentifier}
      (id, shop, state, isOnline, expires, scope, accessToken, onlineAccessInfo)
    SELECT id, shop, state, isOnline, expires, scope, accessToken, onlineAccessInfo
    FROM ${tempTableName};
  `;
  await connection.query(insert);

  // 4. Delete old renamed table
  const drop = `DROP TABLE ${tempTableName};`;
  await connection.query(drop);

  await connection.executeRawQuery('COMMIT');
}
