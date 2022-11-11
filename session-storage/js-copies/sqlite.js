import sqlite3 from 'sqlite3';
import {Session} from '@shopify/shopify-api';

const defaultSQLiteSessionStorageOptions = {
  sessionTableName: 'shopify_sessions',
};

export class SQLiteSessionStorage {
  constructor(filename, opts = {}) {
    this.filename = filename;
    this.options = {...defaultSQLiteSessionStorageOptions, ...opts};
    this.db = new sqlite3.Database(this.filename);
    this.ready = this.init();
  }

  async storeSession(session) {
    await this.ready;

    const entries = session.toPropertyArray();

    const query = `
      INSERT OR REPLACE INTO ${this.options.sessionTableName}
      (${entries.map(([key]) => key).join(', ')})
      VALUES (${entries.map(() => '?').join(', ')});
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
      WHERE id = ?;
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
    const rows = await this.query(query, [shop]);
    if (!Array.isArray(rows) || rows?.length === 0) return [];

    const results = rows.map((row) => {
      return Session.fromPropertyArray(Object.entries(row));
    });
    return results;
  }

  async hasSessionTable() {
    const query = `
    SELECT name FROM sqlite_schema
    WHERE
      type = 'table' AND
      name = ?;
    `;
    const rows = await this.query(query, [this.options.sessionTableName]);
    return rows.length === 1;
  }

  async init() {
    const hasSessionTable = await this.hasSessionTable();
    if (!hasSessionTable) {
      const query = `
        CREATE TABLE ${this.options.sessionTableName} (
          id varchar(255) NOT NULL PRIMARY KEY,
          shop varchar(255) NOT NULL,
          state varchar(255) NOT NULL,
          isOnline integer NOT NULL,
          expires integer,
          scope varchar(255),
          accessToken varchar(255),
          onlineAccessInfo varchar(255)
        )
      `;
      await this.query(query);
    }
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
}
