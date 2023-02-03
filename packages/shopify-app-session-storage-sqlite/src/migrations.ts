import {SqliteConnection} from './sqlite-connection';

export const migrationMap = new Map([['internal_v101', migrateToV1_0_1]]);

// need to migrate exisiting scope from varchar 255 to varchar 1024
async function migrateToV1_0_1(connection: SqliteConnection): Promise<void> {
  const tempTableName = `${connection.sessionDBIdentifier}_for_migration_toV101`;

  //  1. rename exisiting table
  const rename = `
    ALTER TABLE ${connection.sessionDBIdentifier} RENAME TO ${tempTableName};
  `;
  await connection.query(rename);

  // 2. Create new table with 1024 chars
  const newTable = `
        CREATE TABLE ${connection.sessionDBIdentifier} (
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
    INSERT INTO ${connection.sessionDBIdentifier} (id,shop,state,isOnline,expires,scope,accessToken,onlineAccessInfo)
      SELECT id,shop,state,isOnline,expires,scope,accessToken,onlineAccessInfo
      FROM ${tempTableName};
  `;
  await connection.query(insert);

  // 4. Delete old renamed table
  const drop = `DROP TABLE ${tempTableName};`;
  await connection.query(drop);
}
