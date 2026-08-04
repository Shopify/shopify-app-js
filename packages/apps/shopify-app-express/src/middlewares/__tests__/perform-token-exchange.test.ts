import {createSecretKey} from 'crypto';

import request from 'supertest';
import express, {Express} from 'express';
import {SignJWT} from 'jose';
import {RequestedTokenType, Session} from '@shopify/shopify-api';

import {shopifyApp, ShopifyApp} from '../../index';
import {testConfig, TEST_SHOP} from '../../__tests__/test-helper';
import {RETRY_INVALID_SESSION_HEADER} from '../../const';

// Build a real app instance through shopifyApp() so the future flag goes
// through the actual config wiring (not mutated after construction).
function buildShopify(overrides: Record<string, any> = {}): ShopifyApp {
  return shopifyApp({
    ...testConfig,
    future: {unstable_tokenExchange: true},
    ...overrides,
  } as any);
}

async function signSessionToken(shopify: ShopifyApp) {
  return new SignJWT({
    aud: shopify.api.config.apiKey,
    dest: `https://${TEST_SHOP}`,
    sub: '42',
  })
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('1h')
    .sign(createSecretKey(Buffer.from(shopify.api.config.apiSecretKey)));
}

async function signWithSecret(shopify: ShopifyApp, secret: string) {
  return new SignJWT({
    aud: shopify.api.config.apiKey,
    dest: `https://${TEST_SHOP}`,
    sub: '42',
  })
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('1h')
    .sign(createSecretKey(Buffer.from(secret)));
}

function buildApp(shopify: ShopifyApp): Express {
  const app = express();
  app.use('/test', shopify.validateAuthenticatedSession());
  app.get('/test/data', async (_req, res) => {
    res.json({ok: true});
  });
  return app;
}

describe('validateAuthenticatedSession with token exchange', () => {
  it('exchanges a valid session token, stores the session, and runs afterAuth once', async () => {
    const afterAuth = jest.fn();
    const shopify = buildShopify({hooks: {afterAuth}});
    const exchange = jest
      .spyOn(shopify.api.auth, 'tokenExchange')
      .mockResolvedValue({
        session: new Session({
          id: shopify.api.session.getOfflineId(TEST_SHOP),
          shop: TEST_SHOP,
          state: '',
          isOnline: false,
          accessToken: 'offline-token',
        }),
      });
    const token = await signSessionToken(shopify);

    const response = await request(buildApp(shopify))
      .get('/test/data')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ok: true});
    expect(exchange).toHaveBeenCalledTimes(1);
    expect(exchange).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      }),
    );

    const stored = await shopify.config.sessionStorage.loadSession(
      shopify.api.session.getOfflineId(TEST_SHOP),
    );
    expect(stored?.accessToken).toBe('offline-token');
    expect(afterAuth).toHaveBeenCalledTimes(1);
  });

  it('exchanges both offline and online tokens when useOnlineTokens is set', async () => {
    const shopify = buildShopify({useOnlineTokens: true});
    const exchange = jest
      .spyOn(shopify.api.auth, 'tokenExchange')
      .mockImplementation(async ({requestedTokenType}: any) => ({
        session: new Session({
          id:
            requestedTokenType === RequestedTokenType.OnlineAccessToken
              ? `${TEST_SHOP}_42`
              : shopify.api.session.getOfflineId(TEST_SHOP),
          shop: TEST_SHOP,
          state: '',
          isOnline: requestedTokenType === RequestedTokenType.OnlineAccessToken,
          accessToken: 'a-token',
        }),
      }));
    const token = await signSessionToken(shopify);

    await request(buildApp(shopify))
      .get('/test/data')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(exchange).toHaveBeenCalledTimes(2);
    expect(exchange).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      }),
    );
    expect(exchange).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
      }),
    );
  });

  it('returns 401 with the retry header for a fetch request with an invalid token', async () => {
    const shopify = buildShopify();
    const badToken = await signWithSecret(shopify, 'a-different-secret');

    const response = await request(buildApp(shopify))
      .get('/test/data')
      .set('Authorization', `Bearer ${badToken}`)
      .expect(401);

    expect(response.headers[RETRY_INVALID_SESSION_HEADER.toLowerCase()]).toBe(
      '1',
    );
  });

  it('renders App Bridge (bounce) for a document request with an invalid token', async () => {
    const shopify = buildShopify();
    const badToken = await signWithSecret(shopify, 'a-different-secret');

    const response = await request(buildApp(shopify))
      .get(`/test/data?id_token=${badToken}`)
      .expect(200);

    expect(response.text).toContain('app-bridge.js');
    expect(response.text).toContain(
      `data-api-key="${shopify.api.config.apiKey}"`,
    );
  });

  it('invalidates the stored token and responds 401 without the retry header when the exchange returns 401', async () => {
    const shopify = buildShopify();
    // A stored-but-inactive session so token exchange runs and there is a
    // session to invalidate.
    const stale = new Session({
      id: shopify.api.session.getOfflineId(TEST_SHOP),
      shop: TEST_SHOP,
      state: '',
      isOnline: false,
      accessToken: 'stale-token',
      expires: new Date(Date.now() - 1000),
    });
    await shopify.config.sessionStorage.storeSession(stale);

    const {HttpResponseError} = jest.requireActual('@shopify/shopify-api');
    jest.spyOn(shopify.api.auth, 'tokenExchange').mockRejectedValue(
      new HttpResponseError({
        message: 'Unauthorized',
        code: 401,
        statusText: 'Unauthorized',
        body: {},
        headers: {},
      }),
    );
    const token = await signSessionToken(shopify);

    const response = await request(buildApp(shopify))
      .get('/test/data')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(
      response.headers[RETRY_INVALID_SESSION_HEADER.toLowerCase()],
    ).toBeUndefined();

    const stored = await shopify.config.sessionStorage.loadSession(
      shopify.api.session.getOfflineId(TEST_SHOP),
    );
    expect(stored?.accessToken).toBeUndefined();
  });

  it('does not use token exchange when the flag is off', async () => {
    const shopify = buildShopify({future: {}});
    const exchange = jest.spyOn(shopify.api.auth, 'tokenExchange');
    const token = await signSessionToken(shopify);

    await request(buildApp(shopify))
      .get('/test/data')
      .set('Authorization', `Bearer ${token}`);

    expect(exchange).not.toHaveBeenCalled();
  });
});

describe('OAuth routes under token exchange', () => {
  it('auth.begin returns an error when token exchange is enabled', async () => {
    const shopify = buildShopify();
    const app = express();
    app.get('/auth', shopify.auth.begin());

    await request(app).get(`/auth?shop=${TEST_SHOP}`).expect(400);
  });

  it('auth.callback returns an error when token exchange is enabled', async () => {
    const shopify = buildShopify();
    const app = express();
    app.get('/auth/callback', shopify.auth.callback());

    await request(app).get(`/auth/callback?shop=${TEST_SHOP}`).expect(400);
  });
});

describe('registerWebhooks', () => {
  it('registers webhooks for the given session', async () => {
    const shopify = buildShopify();
    const register = jest
      .spyOn(shopify.api.webhooks, 'register')
      .mockResolvedValue({} as any);
    const session = new Session({
      id: shopify.api.session.getOfflineId(TEST_SHOP),
      shop: TEST_SHOP,
      state: '',
      isOnline: false,
      accessToken: 'a-token',
    });

    await shopify.registerWebhooks({session});

    expect(register).toHaveBeenCalledWith({session});
  });
});
