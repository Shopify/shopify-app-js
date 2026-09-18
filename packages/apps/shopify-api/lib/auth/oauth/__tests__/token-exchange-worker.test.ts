import {dirname, resolve} from 'node:path';

import {nodeResolve} from '@rollup/plugin-node-resolve';
import {SignJWT} from 'jose';
import {Miniflare} from 'miniflare';
import {rollup} from 'rollup';

let script: string;

beforeAll(async () => {
  const entry = resolve(
    dirname(require.resolve('@shopify/shopify-app-native-spike')),
    '../esm/index.mjs',
  );
  const bundle = await rollup({
    input: 'worker-test',
    plugins: [
      {
        name: 'worker-test',
        resolveId(id) {
          if (id === 'worker-test') return id;
        },
        load(id) {
          if (id !== 'worker-test') return;
          return `
            import {exchangeToken} from ${JSON.stringify(entry)};
            export default {
              async fetch(request) {
                const {token} = await request.json();
                try {
                  const result = await exchangeToken({
                    clientId: 'worker-client', clientSecret: 'worker-secret',
                    secretKey: new TextEncoder().encode('worker-secret'),
                    shop: 'test-shop.myshopify.com', token,
                    requestedTokenType: 'urn:shopify:params:oauth:token-type:offline-access-token',
                    expiring: true,
                  }, {
                    validateShop(shop) {
                      if (shop !== 'test-shop.myshopify.com') throw new Error('Invalid shop');
                      return shop;
                    },
                    fetch: globalThis.fetch.bind(globalThis),
                  });
                  return Response.json({ok: result.ok, shop: result.shop, body: result.body, status: result.response.status});
                } catch (error) {
                  return Response.json({error: error.name, reason: error.reason});
                }
              }
            };
          `;
        },
      },
      nodeResolve({browser: true}),
    ],
  });
  try {
    const {
      output: [chunk],
    } = await bundle.generate({format: 'es'});
    script = chunk.code;
  } finally {
    await bundle.close();
  }
});

test.each([
  {status: 200, valid: true},
  {status: 401, valid: true},
  {status: 429, valid: true},
  {status: 200, valid: false},
])(
  'core exchange in Workers: HTTP $status, valid JWT=$valid',
  async ({status, valid}) => {
    const secretKey = new TextEncoder().encode(
      valid ? 'worker-secret' : 'wrong-secret',
    );
    const token = await new SignJWT({
      aud: 'worker-client',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
      .setProtectedHeader({alg: 'HS256'})
      .sign(secretKey);
    const body =
      status === 200
        ? {
            access_token: 'worker-token',
            scope: 'read_products',
            expires_in: 3600,
          }
        : {error: 'invalid_subject_token'};
    const outbound = jest.fn(async (request: Request) => {
      expect(request.url).toBe(
        'https://test-shop.myshopify.com/admin/oauth/access_token',
      );
      expect(await request.json()).toMatchObject({
        client_id: 'worker-client',
        client_secret: 'worker-secret',
        subject_token: token,
        expiring: '1',
      });
      return new Response(JSON.stringify(body), {
        status,
        headers: {'Content-Type': 'application/json'},
      });
    });
    const worker = new Miniflare({
      compatibilityDate: '2025-10-01',
      modules: true,
      script,
      outboundService: outbound,
    });
    try {
      const response = await worker.dispatchFetch('https://app.example.com', {
        method: 'POST',
        body: JSON.stringify({token}),
      });
      expect(await response.json()).toEqual(
        valid
          ? {ok: status === 200, shop: 'test-shop.myshopify.com', body, status}
          : {error: 'IdTokenVerificationError', reason: 'invalid_token'},
      );
      expect(outbound).toHaveBeenCalledTimes(valid ? 1 : 0);
    } finally {
      await worker.dispose();
    }
  },
  20000,
);
