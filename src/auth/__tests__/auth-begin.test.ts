import request from 'supertest';
import express from 'express';

import {
  shopify,
  getExpectedOAuthBeginParams,
} from '../../__tests__/test-helper';
import {authBegin} from '../auth-begin';

describe('beginAuth', () => {
  const app = express();
  app.get('/auth', async (req, res) => {
    await authBegin({
      req,
      res,
      api: shopify.api,
      config: shopify.config,
    });
  });

  it('properly redirects when running on localhost', async () => {
    shopify.api.config.hostScheme = 'http';
    shopify.api.config.hostName = 'localhost:1234';

    const response = await request(app)
      .get('/auth?shop=my-shop.myshopify.io')
      .expect(302);

    const url = new URL(response.header.location);
    const params = Object.fromEntries(url.searchParams.entries());

    expect(url.host).toBe('my-shop.myshopify.io');
    expect(params).toMatchObject(getExpectedOAuthBeginParams(shopify.api));

    const cookieNames = response.header['set-cookie'].map(
      (cookie: string) => cookie.split('=')[0],
    );
    expect(cookieNames).toEqual(['shopify_app_state', 'shopify_app_state.sig']);
  });
});
