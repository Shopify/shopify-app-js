import mysql from 'mysql2/promise';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class MySqlConnection implements RdbmsConnection {
  sessionDBIdentifier: string;

  constructor(
    private connection: mysql.Connection,
    sessionDBIdentifier: string,
  ) {
    this.connection = connection;
    this.sessionDBIdentifier = sessionDBIdentifier;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    return this.connection.query(query, params);
  }

  async connect(): Promise<void> {
    // Nothing to do here
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    await this.connection.end();
  }

  getDatabase(): string | undefined {
    return this.connection.config.database;
  }

  async hasTable(tablename: string): Promise<boolean> {
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
}
