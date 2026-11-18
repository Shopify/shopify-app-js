import pg from 'pg';
import {parse} from 'pg-connection-string';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class PostgresConnection implements RdbmsConnection {
  sessionStorageIdentifier: string;
  private ready: Promise<void>;
  private pool: pg.Pool;
  private connectionString: string;

  constructor(dbUrl: string, sessionStorageIdentifier: string) {
    this.connectionString = dbUrl;
    this.ready = this.init();
    this.sessionStorageIdentifier = sessionStorageIdentifier;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    await this.ready;
    return (await this.pool.query(query, params)).rows;
  }

  /**
   * Runs a series of queries in a transaction - requires the use of a SINGLE client,
   * hence we can't use the query method above.
   *
   * @param queries an array of SQL queries to execute in a transaction
   */
  async transaction(queries: string[]): Promise<void> {
    await this.ready;

    // check if the first and last queries are BEGIN and COMMIT, if not, add them
    if (queries[0] !== 'BEGIN') {
      queries.unshift('BEGIN');
    }
    if (queries[queries.length - 1] !== 'COMMIT') {
      queries.push('COMMIT');
    }
    const client = await this.pool.connect();
    try {
      for (const query of queries) {
        await client.query(query);
      }
    } catch (error) {
      // rollback if any of the queries fail
      await client.query(`ROLLBACK`);
      throw error;
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    // Since no longer using individual client, use disconnect to reset the pool.
    await this.ready;
    await this.pool.end();
    this.ready = this.init();
  }

  async connect(): Promise<void> {
    await this.ready;
  }

  public getDatabase(): string | undefined {
    const database = parse(this.connectionString).database;
    return database ? decodeURIComponent(database) : undefined;
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

  private async init(): Promise<void> {
    const config = parse(this.connectionString);
    if (config.database) {
      config.database = decodeURIComponent(config.database);
    }
    this.pool = new pg.Pool(config as pg.PoolConfig);
  }
}
