import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

import {Miniflare} from 'miniflare';

test.each([200, 302])(
  'the compiled AI Native exchange handles HTTP %i in Workers without Node APIs',
  async (status) => {
    const esm = resolve(
      dirname(require.resolve('@shopify/shopify-app-native-spike')),
      '../esm',
    );
    const outbound = jest.fn(async (request: Request) => {
      expect(request.url).toBe(
        'https://test-shop.myshopify.com/admin/oauth/access_token',
      );
      expect(request.method).toBe('POST');
      expect(await request.json()).toMatchObject({
        client_id: 'worker-client',
        client_secret: 'worker-secret',
        subject_token: 'verified-token',
        expiring: 1,
      });
      return new Response(
        JSON.stringify({
          access_token: 'worker-token',
          scope: 'read_products',
          expires_in: 3600,
        }),
        {
          status,
          headers: {
            'Content-Type': 'application/json',
            ...(status === 302 && {Location: 'https://attacker.example'}),
          },
        },
      );
    });
    const worker = new Miniflare({
      compatibilityDate: '2025-10-01',
      modules: [
        {
          type: 'ESModule',
          path: 'worker.mjs',
          contents: `
          import {shopifyApp} from './native/index.mjs';
          export default {
            async fetch() {
              const app = shopifyApp('worker-client', 'worker-secret');
              const result = await app.exchangeUsingTokenExchange({
                accessMode: 'offline',
                idToken: {exchangeable: true, token: 'verified-token', claims: {dest: 'https://test-shop.myshopify.com'}},
              });
              return Response.json(result);
            }
          };
        `,
        },
        ...['index', 'transport'].map((name) => ({
          type: 'ESModule' as const,
          path: `native/${name}.mjs`,
          contents: readFileSync(resolve(esm, `${name}.mjs`), 'utf8'),
        })),
      ],
      outboundService: outbound,
    });
    try {
      const response = await worker.dispatchFetch('https://app.example.com');
      expect(outbound).toHaveBeenCalledTimes(1);
      expect(await response.json()).toMatchObject({
        ok: status === 200,
        shop: 'test-shop',
        accessToken:
          status === 200
            ? {token: 'worker-token', accessMode: 'offline'}
            : null,
        response: {status: status === 200 ? 200 : 500},
      });
    } finally {
      await worker.dispose();
    }
  },
  20000,
);
