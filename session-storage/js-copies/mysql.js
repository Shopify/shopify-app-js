import mysql from 'mysql2/promise';
import {Session} from '@shopify/shopify-api';

const defaultMySQLSessionStorageOptions = {
  sessionTableName: 'shopify_sessions',
};

export class MySQLSessionStorage {
  static withCredentials(host, dbName, username, password, opts) {
    return new MySQLSessionStorage(
      new URL(
        `mysql://${encodeURIComponent(username)}:${encodeURIComponent(
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
    this.options = {...defaultMySQLSessionStorageOptions, ...opts};
    this.ready = this.init();
  }

  async storeSession(session) {
    await this.ready;

    const entries = session.toPropertyArray();
    const query = `
      REPLACE INTO ${this.options.sessionTableName}
      (${entries.map(([key]) => key).join(', ')})
      VALUES (${entries.map(() => `?`).join(', ')})
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
      SELECT * FROM \`${this.options.sessionTableName}\`
      WHERE id = ?;
    `;
    const [rows] = await this.query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    const rawResult = rows[0];
    return Session.fromPropertyArray(Object.entries(rawResult));
  }

  async deleteSession(id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id = ?;
    `;
    await this.query(query, [id]);
    return true;
  }

  async deleteSessions(ids) {
    await this.ready;
    const query = `
      DELETE FROM ${this.options.sessionTableName}
      WHERE id IN (${ids.map(() => '?').join(',')});
    `;
    await this.query(query, ids);
    return true;
  }

  async findSessionsByShop(shop) {
    await this.ready;

    const query = `
      SELECT * FROM ${this.options.sessionTableName}
      WHERE shop = ?;
    `;
    const [rows] = await this.query(query, [shop]);
    if (!Array.isArray(rows) || rows?.length === 0) return [];

    const results = rows.map((row) => {
      return Session.fromPropertyArray(Object.entries(row));
    });
    return results;
  }

  async disconnect() {
    await this.connection.end();
  }

  async init() {
    this.connection = await mysql.createConnection(this.dbUrl.toString());
    await this.createTable();
  }

  async hasSessionTable() {
    const query = `
      SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?;
    `;
    const [rows] = await this.query(query, [this.options.sessionTableName]);
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
          isOnline tinyint NOT NULL,
          scope varchar(255),
          expires integer,
          onlineAccessInfo varchar(255),
          accessToken varchar(255)
        )
      `;
      await this.query(query);
    }
  }

  query(sql, params = []) {
    return this.connection.query(sql, params);
  }
}
