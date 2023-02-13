import * as child_process from 'child_process';
import {promisify} from 'util';

import pg from 'pg';
import {poll} from '@shopify/shopify-app-session-storage-test-utils';
import {Session} from '@shopify/shopify-api';

import {PostgreSQLSessionStorage} from '../postgresql';

const exec = promisify(child_process.exec);

const dbName = 'migratetocasesensitivitytest';
const dbURL = new URL(`postgres://shopify:passify@localhost:5433/${dbName}`);

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

let storage: PostgreSQLSessionStorage;
let containerId: string;
let pool: pg.Pool;

beforeAll(async () => {
  const runCommand = await exec(
    `podman run -d -e POSTGRES_DB=${dbName} -e POSTGRES_USER=shopify -e POSTGRES_PASSWORD=passify -p 5433:5432 postgres:15`,
    {encoding: 'utf8'},
  );

  containerId = runCommand.stdout.trim();

  pool = new pg.Pool({
    connectionString: dbURL.toString(),
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 1000,
  });
});

afterAll(async () => {
  await pool.end();
  await exec(`podman rm -f ${containerId}`);
});

['ShopifySessionsUpperCase', 'shopifysessionslowercase'].forEach(
  async (sessionTableName) => {
    describe(`Migrate to case insensitivity - tablename = ${sessionTableName}`, () => {
      beforeAll(async () => {
        const query = `
          DROP TABLE IF EXISTS ${sessionTableName.toLowerCase()};
          DROP TABLE IF EXISTS ${sessionTableName};
          CREATE TABLE ${sessionTableName.toLowerCase()} (
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

        await poll(
          async () => {
            try {
              const client = await pool.connect();
              await client.query(query, []);
              client.release();
            } catch (error) {
              // uncomment for debugging tests
              // console.error(error);
              return false;
            }
            return true;
          },
          {interval: 500, timeout: 20000},
        );
      });

      it(`initially satisfies case-insensitive conditions`, async () => {
        const client = await pool.connect();
        try {
          const result = await client.query(
            `SELECT EXISTS(SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = '${sessionTableName.toLowerCase()}')`,
          );
          expect(result.rows[0].exists).toBeTruthy();
        } catch (error) {
          console.error(error);
        }
        if (sessionTableName.toLowerCase() !== sessionTableName) {
          // check that the uppercase table does not exist
          try {
            const result = await client.query(
              `SELECT EXISTS(SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = '${sessionTableName}')`,
            );
            expect(result.rows[0].exists).toBeFalsy();
          } catch (error) {
            console.error(error);
          }
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
        try {
          const result = await client.query(
            `SELECT id FROM ${sessionTableName}`,
          );
          expect(result.rows.length).toBe(1);
        } catch (error) {
          console.error(error);
        }
        client.release();
      });

      it(`migrates previous tablenames and column names to be case-sensitive`, async () => {
        storage = new PostgreSQLSessionStorage(dbURL, {
          sessionDBIdentifier: sessionTableName,
          port: 5433,
        });
        try {
          await storage.ready;
        } catch (error) {
          console.error('DEBUG: error from storage.ready', error);
        }

        const client = await pool.connect();
        if (sessionTableName.toLowerCase() !== sessionTableName) {
          try {
            const result = await client.query(
              `SELECT EXISTS(SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = '${sessionTableName.toLowerCase()}')`,
            );
            expect(result.rows[0].exists).toBeFalsy();
          } catch (error) {
            console.error(error);
          }
        }
        try {
          const result = await client.query(
            `SELECT EXISTS(SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = '${sessionTableName}')`,
          );
          expect(result.rows[0].exists).toBeTruthy();
        } catch (error) {
          console.error(error);
        }
        try {
          const result = await client.query(
            `SELECT "id" FROM "${sessionTableName}"`,
          );
          expect(result.rows.length).toBe(1);
        } catch (error) {
          console.error(error);
        }
        client.release();

        let sessionFromDB: Session | undefined;
        try {
          sessionFromDB = await storage.loadSession(sessionId);
        } catch (error) {
          console.error('DEBUG: error from storage.loadSession', error);
        }
        await storage.disconnect();

        expect(sessionFromDB).not.toBeUndefined();
        expect(sessionFromDB!.id).toBe(sessionId);
        expect(sessionFromDB!.shop).toBe(session.shop);
        expect(sessionFromDB!.state).toBe(session.state);
        expect(sessionFromDB!.isOnline).toBe(session.isOnline);
        expect(sessionFromDB!.expires).toStrictEqual(session.expires);
        expect(sessionFromDB!.scope).toBe(session.scope);
        expect(sessionFromDB!.accessToken).toBe(session.accessToken);
        expect(sessionFromDB!.onlineAccessInfo).toEqual(
          session.onlineAccessInfo,
        );
      });
    });
  },
);

['ShopifySessionsUpperCase', 'shopifysessionslowercase'].forEach(
  async (sessionTableName) => {
    describe(`Table is already case-sensitive - tablename = ${sessionTableName}`, () => {
      beforeAll(async () => {
        const query = `
          DROP TABLE IF EXISTS "${sessionTableName.toLowerCase()}";
          DROP TABLE IF EXISTS "${sessionTableName}";
          CREATE TABLE "${sessionTableName}" (
            "id" varchar(255) NOT NULL PRIMARY KEY,
            "shop" varchar(255) NOT NULL,
            "state" varchar(255) NOT NULL,
            "isOnline" boolean NOT NULL,
            "scope" varchar(255),
            "expires" integer,
            "onlineAccessInfo" varchar(255),
            "accessToken" varchar(255)
          )
        `;

        await poll(
          async () => {
            try {
              const client = await pool.connect();
              await client.query(query, []);
              client.release();
            } catch (error) {
              // uncomment for debugging tests
              // console.error(error);
              return false;
            }
            return true;
          },
          {interval: 500, timeout: 20000},
        );
      });

      it(`initially satisfies case-sensitive conditions`, async () => {
        const client = await pool.connect();
        try {
          const result = await client.query(
            `SELECT EXISTS(SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = '${sessionTableName}')`,
          );
          expect(result.rows[0].exists).toBeTruthy();
        } catch (error) {
          console.error(error);
        }
        const entries = session
          .toPropertyArray()
          .map(([key, value]) =>
            key === 'expires'
              ? [key, Math.floor((value as number) / 1000)]
              : [key, value],
          );
        const query = `
          INSERT INTO "${sessionTableName}"
          (${entries.map(([key]) => `"${key}"`).join(', ')})
          VALUES (${entries.map((_, i) => `$${i + 1}`).join(', ')})
          ON CONFLICT ("id") DO UPDATE SET ${entries
            .map(([key]) => `"${key}" = Excluded."${key}"`)
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
        try {
          const result = await client.query(
            `SELECT "id" FROM "${sessionTableName}"`,
          );
          expect(result.rows.length).toBe(1);
        } catch (error) {
          console.error(error);
        }
        client.release();
      });

      it(`doesn't perform any migration`, async () => {
        storage = new PostgreSQLSessionStorage(dbURL, {
          sessionDBIdentifier: sessionTableName,
          port: 5433,
        });
        try {
          await storage.ready;
        } catch (error) {
          console.error('DEBUG: error from storage.ready', error);
        }

        const client = await pool.connect();
        if (sessionTableName.toLowerCase() !== sessionTableName) {
          try {
            const result = await client.query(
              `SELECT EXISTS(SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = '${sessionTableName.toLowerCase()}')`,
            );
            expect(result.rows[0].exists).toBeFalsy();
          } catch (error) {
            console.error(error);
          }
        }
        try {
          const result = await client.query(
            `SELECT EXISTS(SELECT tablename FROM pg_catalog.pg_tables WHERE tablename = '${sessionTableName}')`,
          );
          expect(result.rows[0].exists).toBeTruthy();
        } catch (error) {
          console.error(error);
        }
        try {
          const result = await client.query(
            `SELECT "id" FROM "${sessionTableName}"`,
          );
          expect(result.rows.length).toBe(1);
        } catch (error) {
          console.error(error);
        }
        client.release();

        let sessionFromDB: Session | undefined;
        try {
          sessionFromDB = await storage.loadSession(sessionId);
        } catch (error) {
          console.error('DEBUG: error from storage.loadSession', error);
        }
        await storage.disconnect();

        expect(sessionFromDB).not.toBeUndefined();
        expect(sessionFromDB!.id).toBe(sessionId);
        expect(sessionFromDB!.shop).toBe(session.shop);
        expect(sessionFromDB!.state).toBe(session.state);
        expect(sessionFromDB!.isOnline).toBe(session.isOnline);
        expect(sessionFromDB!.expires).toStrictEqual(session.expires);
        expect(sessionFromDB!.scope).toBe(session.scope);
        expect(sessionFromDB!.accessToken).toBe(session.accessToken);
        expect(sessionFromDB!.onlineAccessInfo).toEqual(
          session.onlineAccessInfo,
        );
      });
    });
  },
);
