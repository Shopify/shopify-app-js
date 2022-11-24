import request from 'supertest';
import express from 'express';

import {shopify, TEST_SHOP} from '../../__tests__/test-helper';
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

  it('triggers library auth start', async () => {
    const beginMock = jest.spyOn(shopify.api.auth, 'begin');
    beginMock.mockImplementationOnce(async ({rawResponse}) => {
      rawResponse.redirect('https://oauth-url');
    });

    const response = await request(app)
      .get(`/auth?shop=${TEST_SHOP}`)
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
});
