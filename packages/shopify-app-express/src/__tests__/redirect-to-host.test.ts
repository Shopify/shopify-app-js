import {Session} from '@shopify/shopify-api';
import express from 'express';
import request from 'supertest';

import {redirectToHost} from '../redirect-to-host';

import {BASE64_HOST, shopify, SHOPIFY_HOST, TEST_SHOP} from './test-helper';

describe('redirectToHost', () => {
  const session = new Session({
    id: 'session-id',
    accessToken: 'access-token',
    shop: TEST_SHOP,
    isOnline: false,
    state: '1234',
  });

  const app = express();
  app.get('/redirect-to-host', async (req, res) => {
    await redirectToHost({
      req,
      res,
      api: shopify.api,
      config: shopify.config,
      session,
    });
  });

  it('redirects to Shopify when embedded', async () => {
    const host = BASE64_HOST;
    const response = await request(app)
      .get(`/redirect-to-host?host=${host}&embedded=1`)
      .expect(302);

    const url = new URL(response.header.location);
    expect(url.host).toBe(SHOPIFY_HOST);
    expect(url.pathname).toBe(`/apps/${shopify.api.config.apiKey}`);
  });

  it('redirects to app when not embedded', async () => {
    shopify.api.config.isEmbeddedApp = false;

    const host = BASE64_HOST;
    const response = await request(app)
      .get(`/redirect-to-host?host=${host}&embedded=1`)
      .expect(302);

    expect(response.header.location).toBe(
      `/?shop=${TEST_SHOP}&host=${encodeURIComponent(host)}`,
    );
  });
});
