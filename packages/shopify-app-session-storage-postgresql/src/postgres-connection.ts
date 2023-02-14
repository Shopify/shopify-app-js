import pg from 'pg';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class PostgresConnection implements RdbmsConnection {
  sessionStorageIdentifier: string;
  private ready: Promise<void>;
  private client: pg.Client;

  constructor(dbUrl: string, sessionStorageIdentifier: string) {
    this.ready = this.init(dbUrl);
    this.sessionStorageIdentifier = sessionStorageIdentifier;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    await this.ready;
    return (await this.client.query(query, params)).rows;
  }

  async disconnect(): Promise<void> {
    await this.ready;
    await this.client.end();
  }

  async connect(): Promise<void> {
    await this.ready;
    await this.client.connect();
  }

  public getDatabase(): string | undefined {
    return this.client.database;
  }

  async hasTable(tablename: string): Promise<boolean> {
    await this.ready;
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

  private async init(dbUrl: string): Promise<void> {
    this.client = new pg.Client({connectionString: dbUrl.toString()});
  }
}
