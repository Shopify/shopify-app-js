import request from 'supertest';
import express from 'express';

import {
  CallbackInfo,
  shopify,
  SHOPIFY_HOST,
  mockShopifyResponse,
  asssertShopifyAuthRequestMade,
  convertBeginResponseToCallbackInfo,
  getExpectedOAuthBeginParams,
} from '../../__tests__/test-helper';
import {createAuthCallback} from '../auth-callback';
import {createAuthBegin} from '../auth-begin';

const TEST_SHOP = 'my-shop.myshopify.io';

const TOKEN_RESPONSE = {
  access_token: 'totally-real-access-token',
  scope: 'read_products',
};

describe('completeAuth', () => {
  const app = express();
  app.get('/auth', async (req, res) => {
    await createAuthBegin({
      api: shopify.api,
      config: shopify.config,
    })(req, res);
  });
  app.get('/auth/callback', async (req, res) => {
    await createAuthCallback({
      api: shopify.api,
      config: shopify.config,
    })(req, res);
  });

  let callbackInfo: CallbackInfo;
  beforeEach(async () => {
    // Always start off with a valid begin request
    const beginResponse = await request(app)
      .get(`/auth?shop=${TEST_SHOP}`)
      .expect(302);
    callbackInfo = convertBeginResponseToCallbackInfo(
      beginResponse,
      shopify.api.config.apiSecretKey,
      TEST_SHOP,
    );
  });

  describe('when successful', () => {
    beforeEach(async () => {
      // Set up the mock response from Shopify since we know we'll complete OAuth
      mockShopifyResponse(TOKEN_RESPONSE);
    });

    afterEach(() => {
      // Assert that the OAuth request actually went through
      asssertShopifyAuthRequestMade(TEST_SHOP, callbackInfo);
    });

    it('creates a session', async () => {
      const response = await request(app)
        .get(`/auth/callback?${callbackInfo.params.toString()}`)
        .set('Cookie', callbackInfo.cookies)
        .expect(302);

      const url = new URL(response.header.location);
      expect(url.host).toBe(SHOPIFY_HOST);
      expect(url.pathname).toBe(`/apps/${shopify.api.config.apiKey}`);

      const session = await shopify.api.session.getOffline({shop: TEST_SHOP});
      expect(session).toBeDefined();
      expect(session!.shop).toEqual(TEST_SHOP);
      expect(session?.accessToken).toEqual('totally-real-access-token');
    });

    it('calls afterAuth callback', async () => {
      let callbackCalled = false;
      shopify.config.auth.afterAuth = async ({req, res, api, session}) => {
        callbackCalled = true;

        expect(session).toBeDefined();
        expect(session!.shop).toEqual(TEST_SHOP);
        expect(req).toBeDefined();
        expect(res).toBeDefined();
        expect(api).toStrictEqual(shopify.api);
      };

      const response = await request(app)
        .get(`/auth/callback?${callbackInfo.params.toString()}`)
        .set('Cookie', callbackInfo.cookies)
        .expect(302);

      const url = new URL(response.header.location);
      expect(url.host).toBe(SHOPIFY_HOST);
      expect(url.pathname).toBe(`/apps/${shopify.api.config.apiKey}`);
      expect(callbackCalled).toBe(true);
    });

    it('does not redirect if afterAuth redirects', async () => {
      let callbackCalled = false;
      shopify.config.auth.afterAuth = async ({res}) => {
        callbackCalled = true;
        res.redirect('https://example.com');
      };

      const response = await request(app)
        .get(`/auth/callback?${callbackInfo.params.toString()}`)
        .set('Cookie', callbackInfo.cookies)
        .expect(302);

      expect(response.header.location).toEqual('https://example.com');
      expect(callbackCalled).toBe(true);
    });

    it.todo('registers all webhook types');
  });

  describe('fails', () => {
    let consoleWarnMock: jest.SpyInstance;
    beforeEach(() => {
      consoleWarnMock = jest.spyOn(global.console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleWarnMock.mockRestore();
    });

    it('if there is no cookie, but restarts OAuth', async () => {
      const response = await request(app)
        .get(`/auth/callback?${callbackInfo.params.toString()}`)
        .expect(302);

      // We begin a new OAuth flow, so the outcome is a successful OAuth begin flow...
      const url = new URL(response.header.location);
      const params = Object.fromEntries(url.searchParams.entries());

      expect(url.host).toBe('my-shop.myshopify.io');
      expect(params).toMatchObject(getExpectedOAuthBeginParams(shopify.api));

      const cookieNames = response.header['set-cookie'].map(
        (cookie: string) => cookie.split('=')[0],
      );
      expect(cookieNames).toEqual([
        'shopify_app_state',
        'shopify_app_state.sig',
      ]);

      // ... with a console.warn
      expect(consoleWarnMock).toHaveBeenCalledTimes(1);
    });

    it('if there is no signature cookie, but restarts OAuth', async () => {
      const cookiesWithoutSignature = callbackInfo.cookies.filter(
        (cookie: string) => !cookie.startsWith('shopify_app_state.sig'),
      );

      const response = await request(app)
        .get(`/auth/callback?${callbackInfo.params.toString()}`)
        .set('Cookie', cookiesWithoutSignature)
        .expect(302);

      // We begin a new OAuth flow, so the outcome is a successful OAuth begin flow...
      const url = new URL(response.header.location);
      const params = Object.fromEntries(url.searchParams.entries());

      expect(url.host).toBe('my-shop.myshopify.io');
      expect(params).toMatchObject(getExpectedOAuthBeginParams(shopify.api));

      const cookieNames = response.header['set-cookie'].map(
        (cookie: string) => cookie.split('=')[0],
      );
      expect(cookieNames).toEqual([
        'shopify_app_state',
        'shopify_app_state.sig',
      ]);

      // ... with a console.warn
      expect(consoleWarnMock).toHaveBeenCalledTimes(1);
    });

    it('if the HMAC is invalid', async () => {
      callbackInfo.params.set('hmac', 'invalid');

      await request(app)
        .get(`/auth/callback?${callbackInfo.params.toString()}`)
        .set('Cookie', callbackInfo.cookies)
        .expect(400)
        .expect('Invalid OAuth callback.');
    });
  });
});
