import mysql from 'mysql2/promise';
import {DBEngine} from '@shopify/shopify-app-session-storage';

export class MySqlEngine implements DBEngine {
  sessionTableName: string;
  constructor(private connection: mysql.Connection, sessionTableName: string) {
    this.connection = connection;
    this.sessionTableName = sessionTableName;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    return this.connection.query(query, params);
  }

  public async disconnect(): Promise<void> {
    await this.connection.end();
  }

  public getDatabase(): string | undefined {
    return this.connection.config.database;
  }
}
