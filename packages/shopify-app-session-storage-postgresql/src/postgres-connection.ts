import pg from 'pg';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class PostgresConnection implements RdbmsConnection {
  sessionDBIdentifier: string;
  useHasTable: boolean;

  constructor(private client: pg.Client, sessionDBIdentifier: string) {
    this.sessionDBIdentifier = sessionDBIdentifier;
    this.useHasTable = false;
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
    return `$${position}`;
  }
}
