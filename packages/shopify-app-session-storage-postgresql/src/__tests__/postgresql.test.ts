import * as child_process from 'child_process';
import {promisify} from 'util';

import pg from 'pg';
import {
  batteryOfTests,
  poll,
} from '@shopify/shopify-app-session-storage-test-utils';
import {Session} from '@shopify/shopify-api';

import {PostgreSQLSessionStorage} from '../postgresql';

const exec = promisify(child_process.exec);

const dbURL = new URL('postgres://shopify:passify@localhost/shopitest');
const dbURL2 = new URL('postgres://shopify:passify@localhost/shopitest2');

describe('PostgreSQLSessionStorage', () => {
  let storage: PostgreSQLSessionStorage;
  let storage2: PostgreSQLSessionStorage;

  let containerId: string;
  beforeAll(async () => {
    const runCommand = await exec(
      'podman run -d -e POSTGRES_DB=shopitest -e POSTGRES_USER=shopify -e POSTGRES_PASSWORD=passify -p 5432:5432 postgres:15',
      {encoding: 'utf8'},
    );

    containerId = runCommand.stdout.trim();

    await poll(
      async () => {
        try {
          const client = new pg.Client({connectionString: dbURL.toString()});
          await client.connect();
          await client.query('CREATE DATABASE shopitest2', []);
          await client.query(
            'GRANT ALL PRIVILEGES ON DATABASE shopitest2 TO shopify',
            [],
          );
          await client.end();
        } catch (error) {
          // console.error(error);  // uncomment to see error for debugging tests
          return false;
        }
        return true;
      },
      {interval: 500, timeout: 20000},
    );
    storage = new PostgreSQLSessionStorage(dbURL);
    storage2 = new PostgreSQLSessionStorage(dbURL2);

    await storage.ready;
    await storage2.ready;
  });

  afterAll(async () => {
    await storage.disconnect();
    await storage2.disconnect();

    await exec(`podman rm -f ${containerId}`);
  });

  const tests = [
    {dbName: 'shopitest', sessionStorage: async () => storage},
    {dbName: 'shopitest2', sessionStorage: async () => storage2},
  ];

  for (const {dbName, sessionStorage} of tests) {
    describe(`with ${dbName}`, () => {
      batteryOfTests(sessionStorage);
    });
  }

  it(`one-time initialisation like migrations and table creations are run only once`, async () => {
    const storageClone1 = new PostgreSQLSessionStorage(dbURL);
    await storageClone1.ready;

    const storageClone2 = new PostgreSQLSessionStorage(dbURL);
    await storageClone2.ready;

    storageClone1.disconnect();
    storageClone2.disconnect();
  });

  it(`can disconnect and reconnect to make queries with the pooling clients`, async () => {
    const storage = new PostgreSQLSessionStorage(dbURL);
    await storage.ready;
    const sessionId = '123';
    const session = new Session({
      id: sessionId,
      shop: 'test-shop.myshopify.com',
      state: 'test-state',
      isOnline: false,
      scope: 'fake_scope',
    });

    expect(await storage.storeSession(session)).toBeTruthy();
    await storage.disconnect();

    const loadedSession = await storage.loadSession(sessionId);
    expect(loadedSession).toEqual(session);
    await storage.disconnect();

    expect(await storage.deleteSession(sessionId)).toBeTruthy();
    await storage.disconnect();
  });
});
