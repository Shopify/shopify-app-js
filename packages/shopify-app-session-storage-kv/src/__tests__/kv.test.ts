import {Miniflare} from 'miniflare';

import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';

import {KVSessionStorage} from '../kv';

describe('KVSessionStorage', () => {
  let storage: KVSessionStorage | undefined;
  beforeAll(async () => {
    const mf = new Miniflare({
      scriptPath:
        'packages/shopify-app-session-storage-kv/src/__tests__/kv-namespace-dummy-worker.ts',
      kvNamespaces: ['KV_TEST_NAMESPACE'],
    });

    storage = new KVSessionStorage(
      await mf.getKVNamespace('KV_TEST_NAMESPACE'),
    );
  });

  batteryOfTests(async () => storage!);
});
