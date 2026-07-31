import {createSecretKey} from 'crypto';

import request from 'supertest';
import express, {Express} from 'express';
import {SignJWT} from 'jose';

import {
  mockShopifyResponse,
  shopify,
  TEST_SHOP,
} from '../../__tests__/test-helper';
import {RETRY_INVALID_SESSION_HEADER} from '../../const';

async function signSessionToken(overrides: Record<string, any> = {}) {
  return new SignJWT({
    aud: shopify.api.config.apiKey,
    dest: `https://${TEST_SHOP}`,
    sub: '42',
    ...overrides,
  })
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('1h')
    .sign(createSecretKey(Buffer.from(shopify.api.config.apiSecretKey)));
}

function buildApp(): Express {
  const app = express();
  app.use('/test', shopify.validateAuthenticatedSession());
  app.get('/test/data', async (_req, res) => {
    res.json({ok: true});
  });
  return app;
}

describe('validateAuthenticatedSession with token exchange', () => {
  let app: Express;

  beforeEach(() => {
    shopify.api.config.isEmbeddedApp = true;
    shopify.config.future = {unstable_tokenExchange: true};
    app = buildApp();
  });

  it('exchanges a valid session token, stores the session, and runs afterAuth', async () => {
    const afterAuth = jest.fn();
    shopify.config.hooks = {afterAuth};
    const token = await signSessionToken();

    mockShopifyResponse({
      access_token: 'offline-token',
      scope: shopify.api.config.scopes.toString(),
    });

    const response = await request(app)
      .get('/test/data')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ok: true});

    const stored = await shopify.config.sessionStorage.loadSession(
      shopify.api.session.getOfflineId(TEST_SHOP),
    );
    expect(stored?.accessToken).toBe('offline-token');
    expect(afterAuth).toHaveBeenCalledTimes(1);
  });

  it('returns 401 with the retry header for a fetch request with an invalid token', async () => {
    const badToken = await new SignJWT({
      aud: shopify.api.config.apiKey,
      dest: `https://${TEST_SHOP}`,
      sub: '42',
    })
      .setProtectedHeader({alg: 'HS256'})
      .setExpirationTime('1h')
      .sign(createSecretKey(Buffer.from('a-different-secret')));

    const response = await request(app)
      .get('/test/data')
      .set('Authorization', `Bearer ${badToken}`)
      .expect(401);

    expect(response.headers[RETRY_INVALID_SESSION_HEADER.toLowerCase()]).toBe(
      '1',
    );
  });

  it('renders App Bridge (bounce) for a document request with an invalid token', async () => {
    const badToken = await new SignJWT({
      aud: shopify.api.config.apiKey,
      dest: `https://${TEST_SHOP}`,
      sub: '42',
    })
      .setProtectedHeader({alg: 'HS256'})
      .setExpirationTime('1h')
      .sign(createSecretKey(Buffer.from('a-different-secret')));

    const response = await request(app)
      .get(`/test/data?id_token=${badToken}`)
      .expect(200);

    expect(response.text).toContain('app-bridge.js');
    expect(response.text).toContain(
      `data-api-key="${shopify.api.config.apiKey}"`,
    );
  });

  it('does not use token exchange when the app is not embedded', async () => {
    shopify.api.config.isEmbeddedApp = false;
    const token = await signSessionToken();
    const tokenExchangeSpy = jest.spyOn(shopify.api.auth, 'tokenExchange');

    await request(app)
      .get('/test/data')
      .set('Authorization', `Bearer ${token}`);

    expect(tokenExchangeSpy).not.toHaveBeenCalled();
  });

  it('does not use token exchange when the flag is off', async () => {
    shopify.config.future = {};
    const token = await signSessionToken();
    const tokenExchangeSpy = jest.spyOn(shopify.api.auth, 'tokenExchange');

    await request(app)
      .get('/test/data')
      .set('Authorization', `Bearer ${token}`);

    expect(tokenExchangeSpy).not.toHaveBeenCalled();
  });
});
