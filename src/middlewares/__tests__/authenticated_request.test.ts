import request from 'supertest';
import express, {Express} from 'express';
import {Session} from '@shopify/shopify-api';
import jwt from 'jsonwebtoken';

import {
  mockShopifyResponse,
  shopify,
  SHOPIFY_HOST,
} from '../../__tests__/test-helper';

describe('authenticatedRequest', () => {
  let app: Express;
  let validJWT: any;
  let session: Session;

  beforeEach(() => {
    app = express();
    app.use('/api', shopify.auth());
    app.use('/test/*', shopify.authenticatedRequest());
    app.get('/test/shop', async (req, res) => {
      res.json({data: {shop: {name: req.query.shop}}});
    });
    validJWT = jwt.sign(
      {
        dummy: 'data',
        aud: shopify.api.config.apiKey,
        dest: 'https://shop=my-shop.myshopify.io',
      },
      shopify.api.config.apiSecretKey,
      {
        algorithm: 'HS256',
      },
    );
    session = new Session({
      id: '123-this-is-a-session-id',
      shop: 'my-shop.myshopify.io',
      state: '123-this-is-a-state',
      isOnline: shopify.config.useOnlineTokens,
      scope: shopify.api.config.scopes.toString(),
      expires: undefined,
      accessToken: 'totally-real-access-token',
    });
  });

  it('active and valid session does not redirect', async () => {
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(session);

    mockShopifyResponse({data: {shop: {name: 'my-shop.myshopify.io'}}});

    const response = await request(app)
      .get('/test/shop?shop=my-shop.myshopify.io')
      .expect(200);

    expect(response.body).toEqual({
      data: {
        shop: {
          name: 'my-shop.myshopify.io',
        },
      },
    });
  });

  it('inactive session with auth header returns 403 with correct headers', async () => {
    session.expires = new Date('2020-12-31T00:00:00');
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(session);

    const response = await request(app)
      .get('/test/shop?shop=my-shop.myshopify.io')
      .set({Authorization: `Bearer ${validJWT}`})
      .expect(403);

    expect(response.headers['x-shopify-api-request-failure-reauthorize']).toBe(
      '1',
    );
    expect(
      response.headers['x-shopify-api-request-failure-reauthorize-url'],
    ).toBe(`/api/auth?shop=my-shop.myshopify.io`);
  });

  it('inactive session without auth header redirects to auth', async () => {
    session.expires = new Date('2020-12-31T00:00:00');
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(session);

    const response = await request(app)
      .get('/test/shop?shop=my-shop.myshopify.io')
      .expect(302);

    expect(response.header.location).toBe(
      `/api/auth?shop=my-shop.myshopify.io`,
    );
  });

  it('no session, with auth header returns 403 with correct headers', async () => {
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(undefined);

    const response = await request(app)
      .get('/test/shop?shop=my-shop.myshopify.io')
      .set({Authorization: `Bearer ${validJWT}`})
      .expect(403);

    expect(response.headers['x-shopify-api-request-failure-reauthorize']).toBe(
      '1',
    );
    expect(
      response.headers['x-shopify-api-request-failure-reauthorize-url'],
    ).toBe(`/api/auth?shop=my-shop.myshopify.io`);
  });

  it('no session, without auth header redirects to auth', async () => {
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(undefined);

    const response = await request(app)
      .get('/test/shop?shop=my-shop.myshopify.io')
      .expect(302);

    expect(response.header.location).toBe(
      `/api/auth?shop=my-shop.myshopify.io`,
    );
  });

  it('redirect to exit iFrame if different shop, embedded param set to 1', async () => {
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(session);

    const encodedHost = Buffer.from(SHOPIFY_HOST, 'utf-8').toString('base64');
    const response = await request(app)
      .get(
        `/test/shop?shop=other-shop.myshopify.io&host=${encodedHost}&embedded=1`,
      )
      .expect(302);

    const expectedRedirectUriStart = new URL(
      shopify.config.auth.path,
      `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}`,
    );
    const location = new URL(response.header.location, 'https://example.com');
    const locationParams = location.searchParams;

    expect(location.pathname).toBe(shopify.config.exitIframePath);
    expect(locationParams.get('shop')).toBe('other-shop.myshopify.io');
    expect(locationParams.get('host')).toBe(encodedHost);
    expect(locationParams.get('redirectUri')).toEqual(
      expect.stringMatching(expectedRedirectUriStart.href),
    );
  });

  it('redirects to auth if different shop, no embedded param', async () => {
    const session = new Session({
      id: '123-this-is-a-session-id',
      shop: 'my-shop.myshopify.io',
      state: '123-this-is-a-state',
      isOnline: shopify.config.useOnlineTokens,
      scope: shopify.api.config.scopes.toString(),
      expires: undefined,
      accessToken: 'totally-real-access-token',
    });
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(session);

    const response = await request(app)
      .get('/test/shop?shop=other-shop.myshopify.io')
      .expect(302);

    const expectedRedirectUriStart = new URL(
      shopify.config.auth.callbackPath,
      `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}`,
    );
    const location = new URL(response.header.location);
    const locationParams = location.searchParams;

    expect(location.hostname).toBe('other-shop.myshopify.io');
    expect(location.pathname).toBe('/admin/oauth/authorize');
    expect(locationParams.get('client_id')).toBe(shopify.api.config.apiKey);
    expect(locationParams.get('scope')).toBe(
      shopify.api.config.scopes.toString(),
    );
    expect(locationParams.get('redirect_uri')).toEqual(
      expect.stringMatching(expectedRedirectUriStart.href),
    );
  });

  it('session found, shops match, scopes differ, with auth header', async () => {
    session.scope = 'read_products,read_draft_orders';
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(session);

    const response = await request(app)
      .get('/test/shop?shop=my-shop.myshopify.io')
      .set({Authorization: `Bearer ${validJWT}`})
      .expect(403);

    expect(response.headers['x-shopify-api-request-failure-reauthorize']).toBe(
      '1',
    );
    expect(
      response.headers['x-shopify-api-request-failure-reauthorize-url'],
    ).toBe(`/api/auth?shop=my-shop.myshopify.io`);
  });

  it('inactive session without auth header redirects to auth', async () => {
    session.scope = 'read_products,read_draft_orders';
    jest
      .spyOn(shopify.api.session, 'getCurrent')
      .mockResolvedValueOnce(session);

    const response = await request(app)
      .get('/test/shop?shop=my-shop.myshopify.io')
      .expect(302);

    expect(response.header.location).toBe(
      `/api/auth?shop=my-shop.myshopify.io`,
    );
  });
});
