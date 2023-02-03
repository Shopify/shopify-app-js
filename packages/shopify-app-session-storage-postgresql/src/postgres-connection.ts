import pg from 'pg';
import {DBConnection} from '@shopify/shopify-app-session-storage';

export class PostgresConnection implements DBConnection {
  sessionPersistenceIdentifier: string;
  useHasTable: boolean;
  sqlArgumentPlaceholder: string;

  constructor(
    private client: pg.Client,
    sessionTableName: string,
    sqlArgumentPlaceholder: string,
  ) {
    this.sessionPersistenceIdentifier = sessionTableName;
    this.useHasTable = false;
    this.sqlArgumentPlaceholder = sqlArgumentPlaceholder;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    return (await this.client.query(query, params)).rows;
  }

  public async disconnect(): Promise<void> {
    await this.client.end();
  }

  public async connect(): Promise<void> {
    await this.client.connect();
  }

  public getDatabase(): string | undefined {
    return this.client.database;
  }

  async hasTable(tablename: string): Promise<boolean> {
    const query = `
      SELECT EXISTS (
        SELECT tablename FROM pg_catalog.pg_tables 
          WHERE tablename = ${this.getArgumentPlaceholder(1)}
      )
  `;

    // Allow multiple apps to be on the same host with separate DB and querying the right
    // DB for the session table exisitence
    const rows = await this.query(query, [tablename]);
    return rows[0].exists;
  }

  getArgumentPlaceholder(position: number): string {
    return `${this.sqlArgumentPlaceholder}${position}`;
  }
}
