import * as child_process from 'child_process';
import {promisify} from 'util';

import {
  batteryOfTests,
  waitForContainerLog,
} from '@shopify/shopify-app-session-storage-test-utils';

import {MongoDBSessionStorage} from '../mongodb';

const exec = promisify(child_process.exec);

const dbURL = new URL(
  `mongodb://${encodeURIComponent('shop&fy')}:${encodeURIComponent(
    'passify$#',
  )}@localhost`,
);
const dbName = 'shopitest';

describe('MongoDBSessionStorage', () => {
  let storage: MongoDBSessionStorage;
  let containerId: string | undefined;
  beforeAll(async () => {
    const runCommand = await exec(
      "podman run -d --network=host -e MONGO_INITDB_DATABASE=shopitest -e MONGO_INITDB_ROOT_USERNAME='shop&fy' -e MONGO_INITDB_ROOT_PASSWORD='passify$#' mongo:5",
      {encoding: 'utf8'},
    );
    containerId = runCommand.stdout.trim();

    await waitForContainerLog(
      async () => {
        const {stdout, stderr} = await exec(`podman logs ${containerId}`);
        const logs = `${stdout}\n${stderr}`;
        const initCompleteLog =
          'MongoDB init process complete; ready for start up.';
        const initCompleteIndex = logs.lastIndexOf(initCompleteLog);

        return initCompleteIndex >= 0 ? logs.slice(initCompleteIndex) : '';
      },
      'Waiting for connections',
      {interval: 500, timeout: 120000},
    );

    storage = new MongoDBSessionStorage(dbURL, dbName);
    await storage.ready;
  }, 180000);

  afterAll(async () => {
    if (storage) await storage.disconnect();
    if (containerId) await exec(`podman rm -f ${containerId}`);
  });

  batteryOfTests(async () => storage);
});
