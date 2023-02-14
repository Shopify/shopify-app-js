import sqlite3 from 'sqlite3';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class SqliteConnection implements RdbmsConnection {
  sessionStorageIdentifier: string;
  private ready: Promise<void>;
  private db: sqlite3.Database;

  constructor(filename: string, sessionStorageIdentifier: string) {
    this.sessionStorageIdentifier = sessionStorageIdentifier;
    this.ready = this.init(filename);
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    await this.ready;

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

  async executeRawQuery(query: string): Promise<void> {
    await this.ready;

    return new Promise((resolve, reject) => {
      this.db.exec(query, (err: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async hasTable(tablename: string): Promise<boolean> {
    await this.ready;

    const query = `
    SELECT name FROM sqlite_schema
    WHERE
      type = 'table' AND
      name = ${this.getArgumentPlaceholder()};
    `;
    const rows = await this.query(query, [tablename]);
    return rows.length === 1;
  }

  getArgumentPlaceholder(_?: number): string {
    return `?`;
  }

  async connect(): Promise<void> {
    await this.ready;

    // Nothing to do here
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    await this.ready;

    // Nothing to do here
    return Promise.resolve();
  }

  private async init(filename: string): Promise<void> {
    this.db = new sqlite3.Database(filename);
  }
}
