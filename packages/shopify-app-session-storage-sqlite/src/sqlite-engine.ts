import sqlite3 from 'sqlite3';
import {DBEngine} from '@shopify/shopify-app-session-storage';

export class SqliteEngine implements DBEngine {
  sessionPersistenceIdentifier: string;
  useHasTable: boolean;
  sqlArgumentPlaceholder: string;

  constructor(
    private db: sqlite3.Database,
    sessionTableName: string,
    sqlArgumentPlaceholder: string,
  ) {
    this.db = db;
    this.sessionPersistenceIdentifier = sessionTableName;
    this.useHasTable = true;
    this.sqlArgumentPlaceholder = sqlArgumentPlaceholder;
  }

  query(query: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  async hasTable(tablename: string): Promise<boolean> {
    const query = `
    SELECT name FROM sqlite_schema
    WHERE
      type = 'table' AND
      name = ${this.sqlArgumentPlaceholder};
    `;
    const rows = await this.query(query, [tablename]);
    return rows.length === 1;
  }

  getArgumentPlaceholder(_: number): string {
    return `${this.sqlArgumentPlaceholder}`;
  }
}
