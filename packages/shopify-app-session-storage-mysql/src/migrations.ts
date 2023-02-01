import {MySqlEngine} from './mysql-engine';

export const migrationMap = new Map([
  ['migrateToVersion1_0_1', migrateToVersion1_0_1],
]);

// need change the sizr of the scope column from 255 to 1024 char
export async function migrateToVersion1_0_1(
  engine: MySqlEngine,
): Promise<void> {
  await engine.query(`ALTER TABLE ${engine.sessionTableName} 
      MODIFY COLUMN scope varchar(1024)`);

  return Promise.resolve();
}
