import * as child_process from 'child_process';
import {promisify} from 'util';

import {
  batteryOfTests,
  poll,
} from '@shopify/shopify-app-session-storage-test-utils';
import mysql2 from 'mysql2/promise';
import {Session} from '@shopify/shopify-api';

import {MySQLSessionStorage} from '../mysql';

const exec = promisify(child_process.exec);

const rootURL = new URL('mysql://root:passify@localhost');
const dbURL = new URL('mysql://shopify:passify@localhost/shopitest');
const dbURL2 = new URL('mysql://shopify:passify@localhost/shopitest2');

describe('MySQLSessionStorage', () => {
  let storage: MySQLSessionStorage;
  let storage2: MySQLSessionStorage;

  let containerId: string;
  beforeAll(async () => {
    const runCommand = await exec(
      'podman run -d -e MYSQL_DATABASE=shopitest -e MYSQL_USER=shopify -e MYSQL_PASSWORD=passify -e MYSQL_ROOT_PASSWORD=passify -p 3306:3306 mysql:8-oracle',
      {encoding: 'utf8'},
    );
    containerId = runCommand.stdout.trim();

    await poll(
      async () => {
        try {
          const connection = await mysql2.createConnection(rootURL.toString());

          await connection.execute(`CREATE DATABASE shopitest2;`);
          await connection.execute(
            `GRANT ALL ON shopitest2.* TO 'shopify'@'%';`,
          );

          await connection.end();
        } catch {
          return false;
        }
        return true;
      },
      {interval: 500, timeout: 20000},
    );

    storage = new MySQLSessionStorage(dbURL);
    storage2 = new MySQLSessionStorage(dbURL2);

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
    const storageClone1 = new MySQLSessionStorage(dbURL);
    await storageClone1.ready;

    const storageClone2 = new MySQLSessionStorage(dbURL);
    await storageClone2.ready;

    storageClone1.disconnect();
    storageClone2.disconnect();
  });

  it(`can disconnect and reconnect to make queries with the pooling clients`, async () => {
    const storage = new MySQLSessionStorage(dbURL);
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
