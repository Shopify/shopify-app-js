import mysql from 'mysql2/promise';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class MySqlConnection implements RdbmsConnection {
  sessionStorageIdentifier: string;
  private ready: Promise<void>;
  private connection: mysql.Connection;

  constructor(dbUrl: string, sessionStorageIdentifier: string) {
    this.ready = this.init(dbUrl);
    this.sessionStorageIdentifier = sessionStorageIdentifier;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    await this.ready;
    return this.connection.query(query, params);
  }

  async connect(): Promise<void> {
    await this.ready;

    // Nothing else to do here
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    await this.ready;
    await this.connection.end();
  }

  getDatabase(): string | undefined {
    return this.connection.config.database;
  }

  async hasTable(tablename: string): Promise<boolean> {
    await this.ready;

    const query = `
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = ${this.getArgumentPlaceholder()} 
          AND TABLE_SCHEMA = ${this.getArgumentPlaceholder()};
    `;

    // Allow multiple apps to be on the same host with separate DB and querying the right
    // DB for the session table exisitence
    const [rows] = await this.connection.query(query, [
      tablename,
      this.getDatabase(),
    ]);
    return Array.isArray(rows) && rows.length === 1;
  }

  getArgumentPlaceholder(_?: number): string {
    return `?`;
  }

  private async init(dbUrl: string): Promise<void> {
    this.connection = await mysql.createConnection(dbUrl.toString());
  }
}
