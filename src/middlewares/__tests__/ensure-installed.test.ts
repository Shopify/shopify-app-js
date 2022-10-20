import request from 'supertest';
import express, {Express} from 'express';
import {Session} from '@shopify/shopify-api';

import {
  mockShopifyResponse,
  shopify,
  SHOPIFY_HOST,
  TEST_SHOP,
} from '../../__tests__/test-helper';

describe('ensureInstalled', () => {
  let app: Express;
  let session: Session;

  beforeEach(async () => {
    app = express();
    app.use('/api', shopify.auth());
    app.use('/test/*', shopify.ensureInstalled());
    app.get('/test/shop', async (req, res) => {
      res.json({data: {shop: {name: req.query.shop}}});
    });
    session = new Session({
      id: '123-this-is-a-session-id',
      shop: TEST_SHOP,
      state: '123-this-is-a-state',
      isOnline: shopify.config.useOnlineTokens,
      scope: shopify.api.config.scopes.toString(),
      expires: undefined,
      accessToken: 'totally-real-access-token',
    });
  });

  it('proceeds to process request if embedded app is installed', async () => {
    mockShopifyResponse({data: {shop: {name: TEST_SHOP}}});
    await shopify.api.config.sessionStorage.storeSession(session);

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
      `frame-ancestors https://${TEST_SHOP} https://admin.shopify.com;`,
    );
  });

  it('returns 500 if no shop provided', async () => {
    await request(app).get(`/test/shop`).expect(500);
  });

  it('returns 500 if invalid shop provided', async () => {
    await request(app).get(`/test/shop?shop=invalid-shop`).expect(500);
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

  it('does NOT redirect to auth if shop NOT installed AND url is exit iFrame path', async () => {
    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    app.use('/exitiframe', shopify.ensureInstalled());
    app.get('/exitiframe', async (_req, res) => {
      res.send('exit iFrame');
    });

    await request(app)
      .get(`/exitiframe?shop=${TEST_SHOP}&host=${encodedHost}&embedded=1`)
      .expect(200);
  });

  it('redirects to embedded URL if shop NOT installed AND url is exit iFrame path AND embedded param missing', async () => {
    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    app.use('/exitiframe', shopify.ensureInstalled());
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

  it('returns 500 if non-embedded app', async () => {
    shopify.api.config.isEmbeddedApp = false;

    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    await request(app)
      .get(`/test/shop?shop=${TEST_SHOP}&host=${encodedHost}`)
      .expect(500);
  });
});
