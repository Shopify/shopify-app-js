import * as child_process from 'child_process';
import {promisify} from 'util';
import {resolve} from 'path';

import {createClient} from 'redis';
import {
  batteryOfTests,
  wait,
} from '@shopify/shopify-app-session-storage-test-utils';

import {RedisSessionStorage} from '../redis';

const exec = promisify(child_process.exec);

const dbURL = new URL('redis://shopify:passify@localhost/1');

type RedisClient = ReturnType<typeof createClient>;
let client: RedisClient;

describe('RedisSessionStorage', () => {
  let storage: RedisSessionStorage | undefined;
  let containerId: string | undefined;
  beforeAll(async () => {
    const configPath = resolve(__dirname, './redis.conf');
    const runCommand = await exec(
      `podman run -d -p 6379:6379 -v ${configPath}:/redis.conf redis:6 redis-server /redis.conf`,
      {encoding: 'utf8'},
    );
    containerId = runCommand.stdout.trim();

    // Give the container a lot of time to set up since polling is ineffective with podman
    await wait(10000);

    storage = new RedisSessionStorage(dbURL);

    // Add different non-Session objects into the DB
    await initWithNonSessionData();

    await storage.ready;
  });

  afterAll(async () => {
    await storage?.disconnect();
    await client.disconnect();
    if (containerId) await exec(`podman rm -f ${containerId}`);
  });

  batteryOfTests(async () => storage!);
});

async function initWithNonSessionData() {
  client = createClient({url: dbURL.toString()});
  await client.connect();

  // Json type different from json array contrary to what is expected by Session.fromPropertyArray
  await client.set(
    'this_is_not_a_session_id',
    JSON.stringify('{"key": "with a random value"}'),
  );

  // Type json array as expected by the the Session.fromPropertyArray but does not contain session data
  await client.set('12563', '["Ford", "BMW", "Fiat"]');

  // Not a json value
  await client.set('256647', 'any random value really');
}
