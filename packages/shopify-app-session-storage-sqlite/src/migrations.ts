import sqlite3 from 'sqlite3';

// need to migrate exisiting scope from varchar 255 to varchar 1024
export async function migrateToVersion1_0_1(
  sessionTableName: string,
  db: sqlite3.Database,
) {
  const tempTableName = `${sessionTableName}_for_migration_toV101`;

  //  1. rename exisiting table
  const rename = `
    ALTER TABLE ${sessionTableName} RENAME TO ${tempTableName};
  `;
  await query(db, rename);

  // 2. Create new table with 1024 chars
  const newTable = `
        CREATE TABLE ${sessionTableName} (
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
  await query(db, newTable);

  // 3. copy all content from old table into new table
  const insert = `
    INSERT INTO ${sessionTableName} (id,shop,state,isOnline,expires,scope,accessToken,onlineAccessInfo)
      SELECT id,shop,state,isOnline,expires,scope,accessToken,onlineAccessInfo
      FROM ${tempTableName};
  `;
  await query(db, insert);

  // 4. Delete old renamed table
  const drop = `DROP TABLE ${tempTableName};`;
  await query(db, drop);
}

function query(
  db: sqlite3.Database,
  sql: string,
  params: any[] = [],
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
