import mysql from 'mysql2/promise';
import {RdbmsConnection} from '@shopify/shopify-app-session-storage';

export class MySqlConnection implements RdbmsConnection {
  sessionStorageIdentifier: string;
  private ready: Promise<void>;
  private dbUrl: URL;
  private connectionPoolLimit: number;
  private pool: mysql.Pool;

  constructor(
    dbUrl: URL,
    sessionStorageIdentifier: string,
    connectionPoolLimit: number,
  ) {
    this.dbUrl = dbUrl;
    this.connectionPoolLimit = connectionPoolLimit;
    this.ready = this.init();
    this.sessionStorageIdentifier = sessionStorageIdentifier;
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    await this.ready;
    return this.pool.query(query, params);
  }

  /**
   * Runs a series of queries in a transaction.
   *
   * @param queries an array of SQL queries to execute in a transaction
   */
  async transaction(queries: string[]): Promise<void> {
    await this.ready;

    // check if the first and last queries are BEGIN and COMMIT, if they are, ignore them
    // mysql2
    if (queries[0] === 'BEGIN') {
      queries.shift();
    }
    if (queries[queries.length - 1] === 'COMMIT') {
      queries.pop();
    }
    const client = await this.pool.getConnection();
    try {
      await client.beginTransaction();
      for (const query of queries) {
        await client.query(query);
      }
      await client.commit();
    } catch (error) {
      // rollback if any of the queries fail
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  }

  async connect(): Promise<void> {
    await this.ready;

    // Nothing else to do here
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    await this.ready;
    await this.pool.end();
    this.ready = this.init();
  }

  getDatabase(): string | undefined {
    return this.dbUrl.pathname.replace(/^\//, '');
  }

  async hasTable(tablename: string): Promise<boolean> {
    await this.ready;

    const query = `
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = ${this.getArgumentPlaceholder()}
          AND TABLE_SCHEMA = ${this.getArgumentPlaceholder()};
    `;

    // Allow multiple apps to be on the same host with separate DB and querying the right
    // DB for the session table existence
    const [rows] = await this.pool.query(query, [
      tablename,
      this.getDatabase(),
    ]);
    return Array.isArray(rows) && rows.length === 1;
  }

  getArgumentPlaceholder(_?: number): string {
    return `?`;
  }

  private async init(): Promise<void> {
    this.pool = await mysql.createPool({
      connectionLimit: this.connectionPoolLimit,
      host: this.dbUrl.hostname,
      user: this.dbUrl.username,
      password: this.dbUrl.password,
      database: this.dbUrl.pathname.replace(/^\//, ''),
    });
  }
}
