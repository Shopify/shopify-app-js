import {Miniflare} from 'miniflare';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';

import {KVSessionStorage} from '../kv';

describe('KVSessionStorage', () => {
  let storage: KVSessionStorage | undefined;
  let mf: Miniflare;
  beforeAll(async () => {
    mf = new Miniflare({
      scriptPath: `${__dirname}/kv-namespace-dummy-worker.ts`,
      kvNamespaces: ['KV_TEST_NAMESPACE'],
      modules: true,
    });

    const namespace = await mf.getKVNamespace('KV_TEST_NAMESPACE');

    // The types from the package seem incorrect, but the implementation is correct. Ignoring the error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    storage = new KVSessionStorage(namespace);
  });

  afterAll(async () => {
    await mf.dispose();
  });

  batteryOfTests(async () => storage!);
});
