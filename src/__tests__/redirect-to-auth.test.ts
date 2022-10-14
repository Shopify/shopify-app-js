import express from 'express';
import request from 'supertest';

import {redirectToAuth} from '../redirect-to-auth';

import {getExpectedOAuthBeginParams, shopify, TEST_SHOP} from './test-helper';

describe('redirectToAuth', () => {
  const app = express();
  app.get('/redirect-to-host', async (req, res) => {
    await redirectToAuth({req, res, api: shopify.api, config: shopify.config});
  });

  it('triggers a server-side redirect with no params', async () => {
    const response = await request(app)
      .get(`/redirect-to-host?shop=${TEST_SHOP}`)
      .expect(302);

    const url = new URL(response.header.location);
    const params = Object.fromEntries(url.searchParams.entries());

    expect(url.host).toBe(TEST_SHOP);
    expect(params).toMatchObject(getExpectedOAuthBeginParams(shopify.api));

    const cookieNames = response.header['set-cookie'].map(
      (cookie: string) => cookie.split('=')[0],
    );
    expect(cookieNames).toEqual(['shopify_app_state', 'shopify_app_state.sig']);
  });

  it('triggers a server-side redirect when embedded is not 1', async () => {
    const response = await request(app)
      .get(`/redirect-to-host?shop=${TEST_SHOP}&embedded=0`)
      .expect(302);

    const url = new URL(response.header.location);
    const params = Object.fromEntries(url.searchParams.entries());

    expect(url.host).toBe(TEST_SHOP);
    expect(params).toMatchObject(getExpectedOAuthBeginParams(shopify.api));
  });

  it('triggers a client-side redirect when embedded is 1', async () => {
    const expectedParams = new URLSearchParams({
      shop: TEST_SHOP,
      host: 'abc',
      embedded: '1',
    });
    const response = await request(app)
      .get(`/redirect-to-host?${expectedParams.toString()}`)
      .expect(302);

    const url = new URL(response.header.location, 'http://not-a-real-host');
    const params = Object.fromEntries(url.searchParams.entries());

    expect(url.host).toBe('not-a-real-host');
    expect(url.pathname).toBe('/exitiframe');
    expect(params).toMatchObject(expectedParams);
  });

  it('fails with invalid shop', async () => {
    const response = await request(app)
      .get(`/redirect-to-host?shop=invalid-shop`)
      .expect(500);

    expect(response.error).toBeDefined();
  });

  it('fails with invalid host', async () => {
    const expectedParams = new URLSearchParams({
      shop: TEST_SHOP,
      embedded: '1',
    });
    const response = await request(app)
      .get(`/redirect-to-host?${expectedParams.toString()}`)
      .expect(500);

    expect(response.error).toBeDefined();
  });
});
