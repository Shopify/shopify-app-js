import {Miniflare} from 'miniflare';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';
import {Session} from '@shopify/shopify-api';

import {KVSessionStorage} from '../kv';

describe('KVSessionStorage', () => {
  let storage: KVSessionStorage | undefined;
  let namespace: KVNamespace;
  let mf: Miniflare;
  beforeAll(async () => {
    mf = new Miniflare({
      scriptPath: `${__dirname}/kv-namespace-dummy-worker.ts`,
      kvNamespaces: ['KV_TEST_NAMESPACE'],
      modules: true,
    });

    // The types from the package seem incorrect, but the implementation is correct. Ignoring the error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    namespace = await mf.getKVNamespace('KV_TEST_NAMESPACE');

    storage = new KVSessionStorage(namespace);
  });

  afterAll(async () => {
    await mf.dispose();
  });

  batteryOfTests(async () => storage!);

  describe('shop session index', () => {
    const shop = 'index-test-shop.myshopify.com';
    const indexKey = `shop:${shop}`;

    function offlineSession(accessToken: string) {
      return new Session({
        id: `offline_${shop}`,
        shop,
        state: 'state',
        isOnline: false,
        accessToken,
      });
    }

    async function readIndex() {
      return namespace.get<string[]>(indexKey, 'json');
    }

    beforeEach(async () => {
      await namespace.delete(indexKey);
      await namespace.delete(`offline_${shop}`);
    });

    it('does not add the same session id again when a session is stored repeatedly', async () => {
      // e.g. an expiring offline token being refreshed three times
      await storage!.storeSession(offlineSession('token-1'));
      await storage!.storeSession(offlineSession('token-2'));
      await storage!.storeSession(offlineSession('token-3'));

      expect(await readIndex()).toEqual([`offline_${shop}`]);
      expect(await storage!.findSessionsByShop(shop)).toHaveLength(1);
    });

    it('compacts an index that already contains duplicates on the next store', async () => {
      await namespace.put(
        indexKey,
        JSON.stringify(Array(500).fill(`offline_${shop}`)),
      );

      await storage!.storeSession(offlineSession('token-1'));

      expect(await readIndex()).toEqual([`offline_${shop}`]);
    });

    it('returns each session once from an index that already contains duplicates', async () => {
      await storage!.storeSession(offlineSession('token-1'));
      await namespace.put(
        indexKey,
        JSON.stringify(Array(500).fill(`offline_${shop}`)),
      );

      const sessions = await storage!.findSessionsByShop(shop);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].accessToken).toBe('token-1');
    });
  });
});
