import request from 'supertest';
import express from 'express';
import {
  CookieNotFound,
  DeliveryMethod,
  InvalidOAuthError,
  LogSeverity,
  Session,
} from '@shopify/shopify-api';

import {BASE64_HOST, shopify, SHOPIFY_HOST} from '../../__tests__/test-helper';

const TEST_SHOP = 'my-shop.myshopify.io';

describe('auth', () => {
  let app: express.Express;
  beforeEach(async () => {
    app = express();
    app.get('/auth', shopify.auth.begin());
    app.get(
      '/auth/callback',
      shopify.auth.callback(),
      shopify.redirectToShopifyOrAppRoot(),
    );
  });

  describe('begin', () => {
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

  describe('callback', () => {
    let callbackMock: jest.SpyInstance;
    let session: Session;
    beforeEach(async () => {
      session = new Session({
        id: 'test-session',
        isOnline: shopify.config.useOnlineTokens,
        shop: TEST_SHOP,
        state: '1234',
        accessToken: 'test-access-token',
      });

      callbackMock = jest.spyOn(shopify.api.auth, 'callback');
    });

    describe('when successful', () => {
      beforeEach(() => {
        callbackMock.mockResolvedValueOnce({session, headers: undefined});
      });

      it('redirects to app', async () => {
        jest.spyOn(shopify.api.webhooks, 'register').mockResolvedValueOnce({});

        const response = await request(app)
          .get(`/auth/callback?host=${BASE64_HOST}`)
          .expect(302);

        const url = new URL(response.header.location);
        expect(url.host).toBe(SHOPIFY_HOST);
        expect(url.pathname).toBe(`/apps/${shopify.api.config.apiKey}`);
      });

      describe('with webhooks', () => {
        let registerMock: jest.SpyInstance;
        beforeEach(() => {
          shopify.api.webhooks.addHandlers({
            TEST_TOPIC: {
              deliveryMethod: DeliveryMethod.Http,
              callbackUrl: '/webhooks',
              callback: async () => {},
            },
          });

          registerMock = jest.spyOn(shopify.api.webhooks, 'register');
        });

        it('registers webhooks', async () => {
          registerMock.mockResolvedValueOnce({
            TEST_TOPIC: [
              {
                success: true,
                result: {},
              },
            ],
          });

          await request(app)
            .get(`/auth/callback?host=${BASE64_HOST}`)
            .expect(302);

          expect(registerMock).toHaveBeenCalledWith({
            session: expect.objectContaining({
              shop: TEST_SHOP,
              accessToken: 'test-access-token',
            }),
          });
        });

        it('logs when registration fails', async () => {
          const errorMessage = 'Test result errors';
          registerMock.mockResolvedValueOnce({
            TEST_TOPIC: [
              {
                success: false,
                result: {errors: [{message: errorMessage}]},
              },
            ],
          });

          await request(app)
            .get(`/auth/callback?host=${BASE64_HOST}`)
            .expect(302);

          expect(
            shopify.api.config.logger.log as jest.Mock,
          ).toHaveBeenCalledWith(
            LogSeverity.Error,
            expect.stringContaining(errorMessage),
          );

          // Reset the callback mock
          callbackMock.mockResolvedValueOnce({session, headers: undefined});
          registerMock.mockResolvedValueOnce({
            TEST_TOPIC: [
              {
                success: false,
                result: {data: {message: errorMessage}},
              },
            ],
          });

          await request(app)
            .get(`/auth/callback?host=${BASE64_HOST}`)
            .expect(302);

          expect(
            shopify.api.config.logger.log as jest.Mock,
          ).toHaveBeenCalledWith(
            LogSeverity.Error,
            expect.stringContaining(errorMessage),
          );
        });
      });
    });

    describe('fails', () => {
      it('restarts OAuth if CookieNotFound', async () => {
        const errorMessage = 'Test no cookie found';
        callbackMock.mockRejectedValueOnce(new CookieNotFound(errorMessage));

        const beginMock = jest.spyOn(shopify.api.auth, 'begin');
        beginMock.mockImplementationOnce(async ({rawResponse}) => {
          rawResponse.redirect('https://oauth-url');
        });

        const response = await request(app)
          .get(`/auth/callback?shop=${TEST_SHOP}&host=${BASE64_HOST}`)
          .expect(302);

        // We begin a new OAuth flow, so the outcome is a successful OAuth begin flow...
        expect(beginMock).toHaveBeenCalledWith(
          expect.objectContaining({
            callbackPath: '/auth/callback',
            isOnline: shopify.config.useOnlineTokens,
            shop: TEST_SHOP,
          }),
        );
        expect(response.header.location).toBe('https://oauth-url');

        expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
          LogSeverity.Error,
          expect.stringContaining(errorMessage),
        );
      });

      it('fails if the request is invalid', async () => {
        const errorMessage = 'Test invalid auth';
        callbackMock.mockRejectedValueOnce(new InvalidOAuthError(errorMessage));

        await request(app)
          .get(`/auth/callback?shop=${TEST_SHOP}&host=${BASE64_HOST}`)
          .expect(400)
          .expect(errorMessage);

        expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
          LogSeverity.Error,
          expect.stringContaining(errorMessage),
        );
      });

      it('borks on unknown errors', async () => {
        const errorMessage = 'Unknown error';
        callbackMock.mockRejectedValueOnce(new Error(errorMessage));

        await request(app)
          .get(`/auth/callback?shop=${TEST_SHOP}&host=${BASE64_HOST}`)
          .expect(500)
          .expect(errorMessage);

        expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
          LogSeverity.Error,
          expect.stringContaining(errorMessage),
        );
      });
    });
  });
});

describe('auth with action after callback', () => {
  const afterAuth = jest.fn();

  let app: express.Express;
  beforeEach(async () => {
    app = express();
    app.get('/auth', shopify.auth.begin());
    app.get('/auth/callback', shopify.auth.callback(), afterAuth);
  });

  let session: Session;
  beforeEach(async () => {
    session = new Session({
      id: 'test-session',
      isOnline: shopify.config.useOnlineTokens,
      shop: TEST_SHOP,
      state: '1234',
      accessToken: 'test-access-token',
    });

    jest
      .spyOn(shopify.api.auth, 'callback')
      .mockResolvedValueOnce({session, headers: undefined});
    jest.spyOn(shopify.api.webhooks, 'register').mockResolvedValueOnce({});
  });

  afterEach(() => {
    afterAuth.mockReset();
  });

  it('triggers callback', async () => {
    afterAuth.mockImplementation(async (req, res) => {
      expect(res.locals.shopify.session).toEqual(session);
      await shopify.redirectToShopifyOrAppRoot()(req, res);
    });

    const response = await request(app)
      .get(`/auth/callback?shop=${TEST_SHOP}&host=${BASE64_HOST}`)
      .expect(302);

    const url = new URL(response.header.location);
    expect(url.host).toBe(SHOPIFY_HOST);
    expect(url.pathname).toBe(`/apps/${shopify.api.config.apiKey}`);
    expect(afterAuth).toHaveBeenCalled();
  });

  it('allows redirecting to arbitrary addresses', async () => {
    afterAuth.mockImplementation(({res}: {res: express.Response}) => {
      res.redirect('https://example.com');
    });

    const response = await request(app)
      .get(`/auth/callback?shop=${TEST_SHOP}&host=${BASE64_HOST}`)
      .expect(302);

    expect(response.header.location).toEqual('https://example.com');
    expect(afterAuth).toHaveBeenCalled();
  });
});
