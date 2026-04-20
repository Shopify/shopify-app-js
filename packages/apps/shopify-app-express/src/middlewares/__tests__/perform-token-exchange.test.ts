import {createSecretKey} from 'crypto';

import request from 'supertest';
import express, {Express} from 'express';
import {Session} from '@shopify/shopify-api';
import {SignJWT} from 'jose';

import {
  shopify,
  mockShopifyResponse,
  mockShopifyResponses,
} from '../../__tests__/test-helper';
import {
  OFFLINE_TOKEN_EXCHANGE_RESPONSE,
  ONLINE_TOKEN_EXCHANGE_RESPONSE,
  EXPIRING_OFFLINE_TOKEN_EXCHANGE_RESPONSE,
} from '../../__tests__/integration/responses';

describe('performTokenExchange', () => {
  let app: Express;
  const shop = 'my-shop.myshopify.io';
  const sub = '1';

  async function createSessionToken(
    overrides: Record<string, any> = {},
  ): Promise<string> {
    return new SignJWT({
      dummy: 'data',
      aud: shopify.api.config.apiKey,
      dest: `https://${shop}`,
      sub,
      ...overrides,
    })
      .setProtectedHeader({alg: 'HS256'})
      .sign(createSecretKey(Buffer.from(shopify.api.config.apiSecretKey)));
  }

  beforeEach(() => {
    shopify.api.config.isEmbeddedApp = true;
    shopify.config.future = {unstable_newEmbeddedAuthStrategy: true};
    shopify.config.useOnlineTokens = false;

    app = express();
    app.use('/test', shopify.validateAuthenticatedSession());
    app.get('/test/shop', async (_req, res) => {
      res.json({session: res.locals.shopify?.session?.shop});
    });
  });

  it('performs token exchange when no offline session exists', async () => {
    const sessionToken = await createSessionToken();
    mockShopifyResponse(OFFLINE_TOKEN_EXCHANGE_RESPONSE);

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(response.body.session).toBe(shop);
  });

  it('performs token exchange when existing session is expired/inactive', async () => {
    const sessionToken = await createSessionToken();
    const offlineId = shopify.api.session.getOfflineId(shop);

    const expiredSession = new Session({
      id: offlineId,
      shop,
      state: 'state',
      isOnline: false,
      accessToken: 'old-token',
      expires: new Date(Date.now() - 60000),
    });
    await shopify.config.sessionStorage.storeSession(expiredSession);

    mockShopifyResponse(OFFLINE_TOKEN_EXCHANGE_RESPONSE);

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(response.body.session).toBe(shop);
  });

  it('returns existing valid session without exchange', async () => {
    const sessionToken = await createSessionToken();
    const offlineId = shopify.api.session.getOfflineId(shop);

    const scopes = shopify.api.config.scopes
      ? shopify.api.config.scopes.toString()
      : '';

    const validSession = new Session({
      id: offlineId,
      shop,
      state: 'state',
      isOnline: false,
      scope: scopes,
      accessToken: 'valid-token',
    });
    await shopify.config.sessionStorage.storeSession(validSession);

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(response.body.session).toBe(shop);
  });

  it('requests online token when useOnlineTokens is true', async () => {
    shopify.config.useOnlineTokens = true;
    const sessionToken = await createSessionToken();

    // First response is offline exchange, second is online exchange
    mockShopifyResponses(
      [OFFLINE_TOKEN_EXCHANGE_RESPONSE],
      [ONLINE_TOKEN_EXCHANGE_RESPONSE],
    );

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(response.body.session).toBe(shop);
  });

  it('calls afterAuth hook after exchange (idempotent — only once per session token)', async () => {
    const afterAuth = jest.fn();
    shopify.config.hooks = {afterAuth};

    const sessionToken = await createSessionToken();
    mockShopifyResponse(OFFLINE_TOKEN_EXCHANGE_RESPONSE);

    await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(afterAuth).toHaveBeenCalledTimes(1);
    expect(afterAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        session: expect.any(Session),
      }),
    );
  });

  it('does NOT call afterAuth when session is already valid', async () => {
    const afterAuth = jest.fn();
    shopify.config.hooks = {afterAuth};

    const sessionToken = await createSessionToken();
    const offlineId = shopify.api.session.getOfflineId(shop);

    const scopes = shopify.api.config.scopes
      ? shopify.api.config.scopes.toString()
      : '';

    const validSession = new Session({
      id: offlineId,
      shop,
      state: 'state',
      isOnline: false,
      scope: scopes,
      accessToken: 'valid-token',
    });
    await shopify.config.sessionStorage.storeSession(validSession);

    await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(afterAuth).not.toHaveBeenCalled();
  });

  it('passes expiring: true to tokenExchange when expiringOfflineAccessTokens is set', async () => {
    shopify.config.future = {
      unstable_newEmbeddedAuthStrategy: true,
      expiringOfflineAccessTokens: true,
    };

    const sessionToken = await createSessionToken();
    mockShopifyResponse(EXPIRING_OFFLINE_TOKEN_EXCHANGE_RESPONSE);

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(response.body.session).toBe(shop);
  });

  it('refreshes near-expiry session via re-exchange when expiringOfflineAccessTokens is set', async () => {
    shopify.config.future = {
      unstable_newEmbeddedAuthStrategy: true,
      expiringOfflineAccessTokens: true,
    };

    const sessionToken = await createSessionToken();
    const offlineId = shopify.api.session.getOfflineId(shop);

    // Session that expires in 2 minutes (within the 5-minute threshold)
    const nearExpirySession = new Session({
      id: offlineId,
      shop,
      state: 'state',
      isOnline: false,
      accessToken: 'about-to-expire-token',
      expires: new Date(Date.now() + 2 * 60 * 1000),
    });
    await shopify.config.sessionStorage.storeSession(nearExpirySession);

    mockShopifyResponse(EXPIRING_OFFLINE_TOKEN_EXCHANGE_RESPONSE);

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(response.body.session).toBe(shop);
  });

  it('returns 401 with retry header on InvalidJwtError', async () => {
    const invalidJWT = await new SignJWT({
      dummy: 'data',
      aud: shopify.api.config.apiKey,
      dest: `https://${shop}`,
      sub,
    })
      .setProtectedHeader({alg: 'HS256'})
      .sign(createSecretKey(Buffer.from('wrong-secret-key-value')));

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${invalidJWT}`)
      .expect(401);

    expect((response.error as any).text).toBeTruthy();
    expect(response.headers['x-shopify-retry-invalid-session-request']).toBe(
      '1',
    );
  });

  it('returns 401 with retry header on 400 invalid_subject_token response', async () => {
    const sessionToken = await createSessionToken();

    mockShopifyResponse(JSON.stringify({error: 'invalid_subject_token'}), {
      status: 400,
    });

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(401);

    expect((response.error as any).text).toBeTruthy();
    expect(response.headers['x-shopify-retry-invalid-session-request']).toBe(
      '1',
    );
  });

  it('returns 401 and invalidates stored access token on Shopify 401 response', async () => {
    const sessionToken = await createSessionToken();
    const offlineId = shopify.api.session.getOfflineId(shop);

    const existingSession = new Session({
      id: offlineId,
      shop,
      state: 'state',
      isOnline: false,
      accessToken: 'revoked-token',
      // expired — forces token exchange
      expires: new Date(Date.now() - 60000),
    });
    await shopify.config.sessionStorage.storeSession(existingSession);

    mockShopifyResponse(JSON.stringify({errors: 'Unauthorized'}), {
      status: 401,
    });

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(401);

    expect((response.error as any).text).toBeTruthy();

    // The stale access token must be cleared from storage so the next request
    // performs a fresh token exchange instead of reusing the revoked token.
    const clearedSession =
      await shopify.config.sessionStorage.loadSession(offlineId);
    expect(clearedSession?.accessToken).toBeUndefined();
  });

  it('returns 500 on unexpected errors', async () => {
    const sessionToken = await createSessionToken();

    mockShopifyResponse(JSON.stringify({errors: 'Something went wrong'}), {
      status: 503,
    });

    const response = await request(app)
      .get('/test/shop')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(500);

    expect((response.error as any).text).toBe('Internal Server Error');
  });
});
