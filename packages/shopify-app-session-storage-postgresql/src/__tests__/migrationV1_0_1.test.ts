import * as child_process from 'child_process';
import {promisify} from 'util';

import pg from 'pg';
import {poll} from '@shopify/shopify-app-session-storage-test-utils';
import {Session} from '@shopify/shopify-api';

import {PostgreSQLSessionStorage} from '../postgresql';

const exec = promisify(child_process.exec);

const dbURL = new URL(
  'postgres://shopify:passify@localhost:5433/migrationtest',
);
const sessionTableName = 'ShopifySessions';

const sessionId = 'test-session-id';
const expiryDate = new Date();
expiryDate.setMilliseconds(0);
expiryDate.setMinutes(expiryDate.getMinutes() + 60);
const testScopes = ['test_scope'];
const session = new Session({
  id: sessionId,
  shop: 'shop.myshopify.com',
  state: 'state',
  isOnline: true,
  expires: expiryDate,
  onlineAccessInfo: {associated_user: {id: 67890}} as any,
  scope: testScopes.toString(),
  accessToken: 'vwxyz-67890-678',
});

describe('PostgreSQLSessionStorage', () => {
  let storage: PostgreSQLSessionStorage;
  let pool: pg.Pool;

  let containerId: string;
  beforeAll(async () => {
    const runCommand = await exec(
      'podman run -d -e POSTGRES_DB=migrationtest -e POSTGRES_USER=shopify -e POSTGRES_PASSWORD=passify -p 5433:5432 postgres:14',
      {encoding: 'utf8'},
    );

    containerId = runCommand.stdout.trim();

    const query = `
      CREATE TABLE IF NOT EXISTS shopifysessions (
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

    pool = new pg.Pool({
      connectionString: dbURL.toString(),
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 1000,
    });
    await poll(
      async () => {
        try {
          const client = await pool.connect();
          await client.query(query, []);
          client.release();
        } catch (error) {
          // console.error(error);
          return false;
        }
        return true;
      },
      {interval: 500, timeout: 20000},
    );
  });

  afterAll(async () => {
    await pool.end();
    await exec(`podman rm -f ${containerId}`);
  });

  it('initially satisfies pre-1.0.1 conditions', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = 'shopifysessions'`,
      );
      expect(result.rows.length).toBe(1);
    } catch (error) {
      // likely tablename doesn't exist
    }
    try {
      const result = await client.query(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = "${sessionTableName}"`,
      );
      expect(result.rows.length).toBe(0);
    } catch (error) {
      // likely tablename doesn't exist
    }

    const entries = session
      .toPropertyArray()
      .map(([key, value]) =>
        key === 'expires'
          ? [key, Math.floor((value as number) / 1000)]
          : [key, value],
      );
    const query = `
      INSERT INTO ${sessionTableName}
      (${entries.map(([key]) => `${key}`).join(', ')})
      VALUES (${entries.map((_, i) => `$${i + 1}`).join(', ')})
      ON CONFLICT (id) DO UPDATE SET ${entries
        .map(([key]) => `${key} = Excluded.${key}`)
        .join(', ')};
    `;
    try {
      await client.query(
        query,
        entries.map(([_key, value]) => value),
      );
    } catch (error) {
      console.error(error);
    }
    client.release();
  });

  it('migrates previous tablenames and column names to 1.0.1', async () => {
    storage = new PostgreSQLSessionStorage(dbURL, {sessionTableName});
    try {
      await storage.ready;
    } catch (error) {
      console.error(error);
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = 'shopifysessions'`,
      );
      expect(result.rows.length).toBe(0);
    } catch (error) {
      // likely tablename doesn't exist
    }
    try {
      const result = await client.query(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = "${sessionTableName}"`,
      );
      expect(result.rows.length).toBe(1);
    } catch (error) {
      // likely tablename doesn't exist
    }
    client.release();

    const sessionFromDB = await storage.loadSession(sessionId);
    await storage.disconnect();

    expect(sessionFromDB).not.toBeUndefined();
    expect(sessionFromDB!.id).toBe(sessionId);
    expect(sessionFromDB!.shop).toBe(session.shop);
    expect(sessionFromDB!.state).toBe(session.state);
    expect(sessionFromDB!.isOnline).toBe(session.isOnline);
    expect(sessionFromDB!.expires).toStrictEqual(session.expires);
    expect(sessionFromDB!.scope).toBe(session.scope);
    expect(sessionFromDB!.accessToken).toBe(session.accessToken);
    expect(sessionFromDB!.onlineAccessInfo).toEqual(session.onlineAccessInfo);
  });
});
