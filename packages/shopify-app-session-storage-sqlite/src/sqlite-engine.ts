import sqlite3 from 'sqlite3';
import {DBEngine} from '@shopify/shopify-app-session-storage';

export class SqliteEngine implements DBEngine {
  sessionTableName: string;
  constructor(private db: sqlite3.Database, sessionTableName: string) {
    this.db = db;
    this.sessionTableName = sessionTableName;
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
}
