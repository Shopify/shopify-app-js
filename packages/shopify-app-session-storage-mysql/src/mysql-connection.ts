import mysql from 'mysql2/promise';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class MySqlConnection implements RdbmsConnection {
  sessionPersistenceIdentifier: string;
  useHasTable: boolean;
  sqlArgumentPlaceholder: string;

  constructor(
    private connection: mysql.Connection,
    sessionTableName: string,
    sqlArgumentPlaceholder: string,
  ) {
    this.connection = connection;
    this.sessionPersistenceIdentifier = sessionTableName;
    this.useHasTable = true;
    this.sqlArgumentPlaceholder = sqlArgumentPlaceholder;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    return this.connection.query(query, params);
  }

  connect(): Promise<void> {
    // Nothing to do here
    return Promise.resolve();
  }

  public async disconnect(): Promise<void> {
    await this.connection.end();
  }

  public getDatabase(): string | undefined {
    return this.connection.config.database;
  }

  async hasTable(tablename: string): Promise<boolean> {
    const query = `
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = ${this.sqlArgumentPlaceholder} 
          AND TABLE_SCHEMA = ${this.sqlArgumentPlaceholder};
    `;

    // Allow multiple apps to be on the same host with separate DB and querying the right
    // DB for the session table exisitence
    const [rows] = await this.connection.query(query, [
      tablename,
      this.getDatabase(),
    ]);
    return Array.isArray(rows) && rows.length === 1;
  }

  getArgumentPlaceholder(_: number): string {
    return `${this.sqlArgumentPlaceholder}`;
  }
}
