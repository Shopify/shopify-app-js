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

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'passify#$',
  database: 'shop&test',
};
const dbURL = new URL(
  `mysql://${encodeURIComponent('shop&fy')}:${encodeURIComponent(
    'passify#$',
  )}@localhost/${encodeURIComponent('shop&test')}`,
);
const dbURL2 = new URL(
  `mysql://${encodeURIComponent('shop&fy')}:${encodeURIComponent(
    'passify#$',
  )}@localhost/${encodeURIComponent('shop&test2')}`,
);

describe('MySQLSessionStorage', () => {
  let storage: MySQLSessionStorage;
  let storage2: MySQLSessionStorage;

  let containerId: string;
  beforeAll(async () => {
    const runCommand = await exec(
      "podman run -d -e MYSQL_DATABASE='shop&test' -e MYSQL_USER='shop&fy' -e MYSQL_PASSWORD='passify#$' -e MYSQL_ROOT_PASSWORD='passify#$' -p 3306:3306 mysql:8-oracle",
      {encoding: 'utf8'},
    );
    containerId = runCommand.stdout.trim();

    await poll(
      async () => {
        try {
          const connection = await mysql2.createConnection(dbConfig);

          await connection.execute(`CREATE DATABASE \`shop&test2\`;`);
          await connection.execute(
            `GRANT ALL ON \`shop&test2\`.* TO \`shop&fy\`@\`%\`;`,
          );

          await connection.end();
        } catch (_error) {
          // console.error(_error);
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

  it(`can successfully connect with a url string instead of a URL object`, async () => {
    const storage = new MySQLSessionStorage(dbURL.toString());
    await storage.ready;
    const session = new Session({
      id: '456',
      shop: 'test-shop.myshopify.com',
      state: 'test-state',
      isOnline: false,
      scope: 'fake_scope',
    });

    expect(await storage.storeSession(session)).toBeTruthy();
    await storage.disconnect();
  });
});
