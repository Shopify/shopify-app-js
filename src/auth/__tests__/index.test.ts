import request from 'supertest';
import express, {Express} from 'express';
import {AccessTokenResponse, OnlineAccessResponse} from '@shopify/shopify-api';

import {
  assertShopifyAuthRequestMade,
  convertBeginResponseToCallbackInfo,
  mockShopifyResponse,
  shopify,
  TEST_SHOP,
} from '../../__tests__/test-helper';

describe('shopify.auth', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use('/test', shopify.auth());
  });

  [
    {scheme: 'https', host: TEST_SHOP, useOnlineTokens: true},
    {scheme: 'https', host: TEST_SHOP, useOnlineTokens: false},
    {scheme: 'http', host: 'localhost', useOnlineTokens: true},
    {scheme: 'http', host: 'localhost', useOnlineTokens: false},
  ].forEach((config) => {
    it(`performs oauth ${JSON.stringify(config)}`, async () => {
      shopify.api.config.hostScheme = config.scheme as 'https' | 'http';
      shopify.api.config.hostName = config.host;
      shopify.config.useOnlineTokens = config.useOnlineTokens;

      // Begin OAuth
      const beginResponse = await request(app)
        .get(`/test/auth?shop=${TEST_SHOP}`)
        .expect(302);

      const beginRedirectUrl = new URL(beginResponse.header.location);
      expect(beginRedirectUrl.protocol).toBe('https:');
      expect(beginRedirectUrl.hostname).toBe(TEST_SHOP);
      expect(beginRedirectUrl.pathname).toBe('/admin/oauth/authorize');

      const redirecUri = new URL(
        beginRedirectUrl.searchParams.get('redirect_uri')!,
      );
      expect(redirecUri.protocol).toBe(`${config.scheme}:`);
      expect(redirecUri.host).toBe(config.host);
      expect(redirecUri.pathname).toBe('/test/auth/callback');

      // Extract information from begin response and prepare callback call
      const callbackInfo = convertBeginResponseToCallbackInfo(
        beginResponse,
        shopify.api.config.apiSecretKey,
        TEST_SHOP,
      );

      mockShopifyResponse(
        config.useOnlineTokens
          ? ONLINE_ACCESS_TOKEN_RESPONSE
          : OFFLINE_ACCESS_TOKEN_RESPONSE,
      );

      // Complete OAuth
      const callbackResponse = await request(app)
        .get(`/test/auth/callback?${callbackInfo.params.toString()}`)
        .set('Cookie', callbackInfo.cookies)
        .expect(302);

      const url = new URL(callbackResponse.header.location);
      expect(url.pathname).toBe(`/apps/${shopify.api.config.apiKey}`);

      assertShopifyAuthRequestMade(TEST_SHOP, callbackInfo);
    });
  });
});

const OFFLINE_ACCESS_TOKEN_RESPONSE: AccessTokenResponse = {
  access_token: 'totally-real-access-token',
  scope: 'read_products',
};

const ONLINE_ACCESS_TOKEN_RESPONSE: OnlineAccessResponse = {
  ...OFFLINE_ACCESS_TOKEN_RESPONSE,
  expires_in: 123456,
  associated_user_scope: 'read_products',
  associated_user: {
    id: 1234,
    first_name: 'first',
    last_name: 'last',
    email: 'email',
    email_verified: true,
    account_owner: true,
    locale: 'en',
    collaborator: true,
  },
};
