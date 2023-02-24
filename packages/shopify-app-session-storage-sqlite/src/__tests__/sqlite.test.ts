import * as fs from 'fs/promises';

import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';

import {SQLiteSessionStorage} from '../sqlite';

const sqliteDbFile = './sqlite.testDb';
describe('SQLiteSessionStorage', () => {
  let storage: SQLiteSessionStorage;
  beforeAll(async () => {
    await fs.unlink(sqliteDbFile).catch(() => {});
    storage = new SQLiteSessionStorage(sqliteDbFile);
  });

  afterAll(async () => {
    await fs.unlink(sqliteDbFile).catch(() => {});
  });

  batteryOfTests(async () => storage);

  it(`one-time initialisation like migrations and table creations are run only once`, async () => {
    const storageClone1 = new SQLiteSessionStorage(sqliteDbFile);
    const storageClone2 = new SQLiteSessionStorage(sqliteDbFile);
  });
});
