import request from 'supertest';
import express, {Express} from 'express';
import {ApiVersion, LogSeverity, Session} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {
  createTestHmac,
  mockShopifyResponse,
  shopify,
  testConfig,
  SHOPIFY_HOST,
  TEST_SHOP,
} from '../../__tests__/test-helper';
import {shopifyApp} from '../../index';

describe('ensureInstalledOnShop', () => {
  let app: Express;
  let session: Session;

  beforeEach(async () => {
    app = express();
    app.use('/test', shopify.ensureInstalledOnShop());
    app.get('/test/shop', async (req, res) => {
      res.json({data: {shop: {name: req.query.shop}}});
    });
    const scopes = shopify.api.config.scopes
      ? shopify.api.config.scopes.toString()
      : '';
    session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      state: '123-this-is-a-state',
      isOnline: false,
      scope: scopes,
      expires: undefined,
      accessToken: 'totally-real-access-token',
    });
  });

  it('proceeds to process request if embedded app is installed', async () => {
    mockShopifyResponse({data: {shop: {name: TEST_SHOP}}});

    await shopify.config.sessionStorage.storeSession(session);

    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    const response = await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
      .expect(200);

    expect(response.body).toEqual({
      data: {
        shop: {
          name: TEST_SHOP,
        },
      },
    });
    expect(response.headers['content-security-policy']).toEqual(
      `frame-ancestors https://${TEST_SHOP} https://admin.shopify.com https://*.spin.dev https://admin.myshopify.io https://admin.shop.dev;`,
    );
  });

  it('returns 400 if no shop provided', async () => {
    await request(app).get(`/test/shop`).expect(400);
  });

  it('returns 422 if invalid shop provided', async () => {
    await request(app).get(`/test/shop?shop=invalid-shop`).expect(422);
  });

  it('returns 400 if no host provided', async () => {
    mockShopifyResponse({data: {shop: {name: TEST_SHOP}}});
    await shopify.config.sessionStorage.storeSession(session);

    await request(app).get(`/test/shop?shop=${TEST_SHOP}`).expect(400);
  });

  it('redirects to auth via exit iFrame if shop NOT installed', async () => {
    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    const response = await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
      .expect(302);

    const expectedRedirectUriStart = new URL(
      shopify.config.auth.path,
      `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}`,
    );
    const location = new URL(response.header.location, 'https://example.com');
    const locationParams = location.searchParams;

    expect(location.pathname).toBe(shopify.config.exitIframePath);
    expect(locationParams.get('shop')).toBe(TEST_SHOP);
    expect(locationParams.get('host')).toBe(encodedHost);
    expect(locationParams.get('redirectUri')).toEqual(
      expect.stringMatching(expectedRedirectUriStart.href),
    );
  });

  it('redirects to auth if not installed and not embedded', async () => {
    mockShopifyResponse({data: {shop: {name: TEST_SHOP}}});

    await shopify.config.sessionStorage.storeSession(session);

    const missingShop = 'some-other-shop.myshopify.io';
    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    const response = await request(app)
      .get(`/test/shop?shop=${missingShop}&host=${encodedHost}`)
      .expect(302);

    const location = new URL(response.header.location);

    expect(location.host).toBe(missingShop);
    expect(location.pathname).toBe('/admin/oauth/authorize');
  });

  it('redirects to auth if installed and not embedded, but token is invalid', async () => {
    mockShopifyResponse({errors: 'Invalid token'}, {status: 401});

    await shopify.config.sessionStorage.storeSession(session);

    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    const response = await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}`)
      .expect(302);

    const location = new URL(response.header.location);

    expect(location.host).toBe(TEST_SHOP);
    expect(location.pathname).toBe('/admin/oauth/authorize');
  });

  it('does NOT redirect to auth if shop NOT installed AND url is exit iFrame path', async () => {
    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    app.use('/exitiframe', shopify.ensureInstalledOnShop());
    app.get('/exitiframe', async (_req, res) => {
      res.send('exit iFrame');
    });

    await request(app)
      .get(`/exitiframe?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
      .expect(200);
  });

  it('redirects to embedded URL if shop is installed AND url is exit iFrame path AND embedded param missing', async () => {
    mockShopifyResponse({data: {shop: {name: TEST_SHOP}}});

    await shopify.config.sessionStorage.storeSession(session);

    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    app.use('/exitiframe', shopify.ensureInstalledOnShop());
    app.get('/exitiframe', async (_req, res) => {
      res.send('exit iFrame');
    });

    const response = await request(app)
      .get(`/exitiframe?shop=${TEST_SHOP}&host=${encodedHost}`)
      .expect(302);

    const location = new URL(response.header.location, 'https://example.com');

    expect(location.hostname).toBe(SHOPIFY_HOST);
    expect(location.pathname).toEqual(
      expect.stringContaining(`apps/${shopify.api.config.apiKey}`),
    );
  });

  it('calls validateAuthenticatedSession for non-embedded apps with a log', async () => {
    shopify.api.config.isEmbeddedApp = false;
    const validCookies = [
      `shopify_app_session=${session.id}`,
      `shopify_app_session.sig=${createTestHmac(
        shopify.api.config.apiSecretKey,
        session.id,
      )}`,
    ];

    mockShopifyResponse({
      data: {},
      extensions: {},
    });
    await shopify.config.sessionStorage.storeSession(session);

    await request(app)
      .get(`/test/shop`)
      .set('Cookie', validCookies)
      .expect(200);

    expect({
      method: 'POST',
      url: `https://test-shop.myshopify.io/admin/api/${ApiVersion.July25}/graphql.json`,
    }).toMatchMadeHttpRequest();

    expect(shopify.api.config.logger.log).toHaveBeenCalledWith(
      LogSeverity.Warning,
      expect.stringContaining(
        'ensureInstalledOnShop() should only be used in embedded apps; calling validateAuthenticatedSession() instead',
      ),
    );
  });
});

describe('ensureInstalledOnShop - token exchange flag', () => {
  const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');

  // Test 1: Flag OFF, no session → redirects to OAuth (regression guard)
  it('flag off, no session → redirects to auth (regression guard)', async () => {
    const app = express();
    app.use('/test', shopify.ensureInstalledOnShop());
    app.get('/test/shop', (_req, res) => res.json({}));

    const response = await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
      .expect(302);

    const location = new URL(response.header.location, 'https://example.com');
    expect(location.pathname).toBe(shopify.config.exitIframePath);
  });

  // Test 2: Flag ON, no session, embedded=1 → CSP headers + next(), no OAuth redirect
  it('flag on, no session, embedded=1 → CSP headers + next()', async () => {
    const shopifyWithFlag = shopifyApp({
      ...testConfig,
      sessionStorage: new MemorySessionStorage(),
      future: {unstable_newEmbeddedAuthStrategy: true},
    });

    const app = express();
    app.use('/test', shopifyWithFlag.ensureInstalledOnShop());
    app.get('/test/shop', (_req, res) => res.json({ok: true}));

    const response = await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.headers['content-security-policy']).toMatch(TEST_SHOP);
  });

  // Test 3: Flag ON, valid session exists, embedded=1 → CSP headers + next(), no GraphQL probe
  it('flag on, valid session, embedded=1 → CSP headers + next(), no GraphQL probe', async () => {
    const sessionStorage = new MemorySessionStorage();
    const shopifyWithFlag = shopifyApp({
      ...testConfig,
      sessionStorage,
      future: {unstable_newEmbeddedAuthStrategy: true},
    });

    const scopes = shopifyWithFlag.api.config.scopes
      ? shopifyWithFlag.api.config.scopes.toString()
      : '';
    const existingSession = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      state: 'state',
      isOnline: false,
      scope: scopes,
      accessToken: 'valid-token',
    });
    await sessionStorage.storeSession(existingSession);

    const app = express();
    app.use('/test', shopifyWithFlag.ensureInstalledOnShop());
    app.get('/test/shop', (_req, res) => res.json({ok: true}));

    const response = await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.headers['content-security-policy']).toMatch(TEST_SHOP);
    // No GraphQL probe should have been made
    expect(fetch).not.toHaveBeenCalled();
  });

  // Test 4: Flag ON, no session, embedded absent → redirects to embedded Shopify URL
  it('flag on, no session, embedded param absent → redirects to embedded Shopify URL', async () => {
    const shopifyWithFlag = shopifyApp({
      ...testConfig,
      sessionStorage: new MemorySessionStorage(),
      future: {unstable_newEmbeddedAuthStrategy: true},
    });

    const app = express();
    app.use('/test', shopifyWithFlag.ensureInstalledOnShop());
    app.get('/test/shop', (_req, res) => res.json({}));

    const response = await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}`)
      .expect(302);

    const location = new URL(response.header.location, 'https://example.com');
    expect(location.hostname).toBe(SHOPIFY_HOST);
    expect(location.pathname).toMatch(
      new RegExp(`apps/${shopifyWithFlag.api.config.apiKey}`),
    );
  });

  // Test 5: Flag ON, no shop param → 400
  it('flag on, no shop param → 400', async () => {
    const shopifyWithFlag = shopifyApp({
      ...testConfig,
      sessionStorage: new MemorySessionStorage(),
      future: {unstable_newEmbeddedAuthStrategy: true},
    });

    const app = express();
    app.use('/test', shopifyWithFlag.ensureInstalledOnShop());
    app.get('/test/shop', (_req, res) => res.json({}));

    await request(app).get('/test/shop').expect(400);
  });
});
