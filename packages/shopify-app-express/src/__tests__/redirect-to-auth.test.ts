import express from 'express';
import request from 'supertest';

import {redirectToAuth} from '../redirect-to-auth';

import {BASE64_HOST, shopify, TEST_SHOP} from './test-helper';

describe('redirectToAuth', () => {
  let app: express.Express;

  let beginMock: jest.SpyInstance;
  beforeEach(() => {
    app = express();
    app.get('/redirect-to-auth', async (req, res) => {
      await redirectToAuth({
        req,
        res,
        api: shopify.api,
        config: shopify.config,
      });
    });

    beginMock = jest.spyOn(shopify.api.auth, 'begin');
    beginMock.mockImplementationOnce(async ({rawResponse}) => {
      rawResponse.redirect('https://oauth-url');
    });
  });

  afterEach(() => {
    beginMock.mockReset();
  });

  it('triggers a server-side redirect with no params', async () => {
    const response = await request(app)
      .get(`/redirect-to-auth?shop=${TEST_SHOP}`)
      .expect(302);

    expect(beginMock).toHaveBeenCalledWith(
      expect.objectContaining({
        callbackPath: '/auth/callback',
        isOnline: shopify.config.useOnlineTokens,
        shop: TEST_SHOP,
      }),
    );
    expect(response.header.location).toBe('https://oauth-url');
  });

  it('triggers a server-side redirect when embedded is not 1', async () => {
    const response = await request(app)
      .get(`/redirect-to-auth?shop=${TEST_SHOP}&embedded=0`)
      .expect(302);

    expect(beginMock).toHaveBeenCalledWith(
      expect.objectContaining({
        callbackPath: '/auth/callback',
        isOnline: shopify.config.useOnlineTokens,
        shop: TEST_SHOP,
      }),
    );
    expect(response.header.location).toBe('https://oauth-url');
  });

  it('triggers a client-side redirect when embedded is 1', async () => {
    const expectedParams = new URLSearchParams({
      shop: TEST_SHOP,
      host: BASE64_HOST,
      embedded: '1',
    });
    const response = await request(app)
      .get(`/redirect-to-auth?${expectedParams.toString()}`)
      .expect(302);

    const url = new URL(
      response.header.location,
      'http://not-a-real-host.myshopify.io',
    );
    const params = Object.fromEntries(url.searchParams.entries());

    expect(url.host).toBe('not-a-real-host.myshopify.io');
    expect(url.pathname).toBe('/exitiframe');
    expect(params).toMatchObject(expectedParams);
  });

  it('fails with invalid shop', async () => {
    const response = await request(app)
      .get(`/redirect-to-auth?shop=invalid-shop`)
      .expect(500);

    expect(response.error).toBeDefined();
  });

  it('fails with invalid host', async () => {
    const expectedParams = new URLSearchParams({
      shop: TEST_SHOP,
      embedded: '1',
    });
    const response = await request(app)
      .get(`/redirect-to-auth?${expectedParams.toString()}`)
      .expect(500);

    expect(response.error).toBeDefined();
  });
});
