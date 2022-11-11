import pg from 'pg';
import {Session} from '@shopify/shopify-api';

const defaultPostgreSQLSessionStorageOptions = {
  sessionTableName: 'shopify_sessions',
  port: 3211,
};

export class PostgreSQLSessionStorage {
  static withCredentials(host, dbName, username, password, opts) {
    return new PostgreSQLSessionStorage(
      new URL(
        `postgres://${encodeURIComponent(username)}:${encodeURIComponent(
          password,
        )}@${host}/${encodeURIComponent(dbName)}`,
      ),
      opts,
    );
  }

  constructor(dbUrl, opts = {}) {
    this.dbUrl = dbUrl;
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultPostgreSQLSessionStorageOptions, ...opts};
    this.ready = this.init();
  }

  async storeSession(session) {
    await this.ready;

    const entries = session.toPropertyArray();
    const query = `
      INSERT INTO ${this.options.sessionTableName}
      (${entries.map(([key]) => key).join(', ')})
      VALUES (${entries.map((_, i) => `$${i + 1}`).join(', ')})
      ON CONFLICT (id) DO UPDATE SET ${entries
        .map(([key]) => `${key} = Excluded.${key}`)
        .join(', ')};
    `;
    await this.query(
      query,
      entries.map(([_key, value]) => value),
    );
    return true;
  }

  async loadSession(id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.options.sessionTableName}
      WHERE id = $1;
    `;
    const rows = await this.query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    const rawResult = rows[0];
    return Session.fromPropertyArray(Object.entries(rawResult));
  }

  async deleteSession(id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id = $1;
    `;
    await this.query(query, [id]);
    return true;
  }

  async deleteSessions(ids) {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id IN (${ids.map((_, i) => `$${i + 1}`).join(', ')});
    `;
    await this.query(query, ids);
    return true;
  }

  async findSessionsByShop(shop) {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.sessionTableName}
      WHERE shop = $1;
    `;
    const rows = await this.query(query, [shop]);
    if (!Array.isArray(rows) || rows?.length === 0) return [];

    const results = rows.map((row) => {
      return Session.fromPropertyArray(Object.entries(row));
    });
    return results;
  }

  disconnect() {
    return this.client.end();
  }

  async init() {
    this.client = new pg.Client({connectionString: this.dbUrl.toString()});
    await this.connectClient();
    await this.createTable();
  }

  async connectClient() {
    await this.client.connect();
  }

  async hasSessionTable() {
    const query = `
      SELECT * FROM pg_catalog.pg_tables WHERE tablename = $1
    `;
    const rows = await this.query(query, [this.options.sessionTableName]);
    return Array.isArray(rows) && rows.length === 1;
  }

  async createTable() {
    const hasSessionTable = await this.hasSessionTable();
    if (!hasSessionTable) {
      const query = `
        CREATE TABLE ${this.options.sessionTableName} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline boolean NOT NULL,
          scope varchar(255),
          expires integer,
          onlineAccessInfo varchar(255),
          accessToken varchar(255)
        )
      `;
      await this.query(query);
    }
  }

  async query(sql, params = []) {
    const result = await this.client.query(sql, params);
    return result.rows;
  }
}
