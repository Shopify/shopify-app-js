import * as ShopifyErrors from '../../../error';
import {DataType, JwtPayload, shopifyApi} from '../../..';
import {testConfig} from '../../../__tests__/test-config';
import {queueMockResponse, signJWT} from '../../../__tests__/test-helper';
import {RequestedTokenType} from '../token-exchange';

let shop: string;
let sessionTokenPayload: JwtPayload;

beforeEach(() => {
  shop = 'someshop.myshopify.io';
});

describe('tokenExchange', () => {
  describe('with a valid parameters', () => {
    beforeEach(() => {
      sessionTokenPayload = {
        iss: `${shop}/admin`,
        dest: shop,
        aud: 'test_key',
        sub: '1',
        exp: Date.now() / 1000 + 3600,
        nbf: 1234,
        iat: 1234,
        jti: '4321',
        sid: 'abc123',
      };
    });

    test('returns an online access token', async () => {
      const shopify = shopifyApi(testConfig());
      const sessionToken = await signJWT(
        shopify.config.apiSecretKey,
        sessionTokenPayload,
      );

      const successResponse = {
        access_token: 'some access token',
        scope: 'pet_kitties, walk_dogs',
        expires_in: 525600,
        associated_user_scope: 'pet_kitties',
        associated_user: {
          id: '8675309',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          email_verified: true,
          account_owner: true,
          locale: 'en',
          collaborator: true,
        },
      };

      const {access_token, scope, ...rest} = successResponse;
      const expectedExpiration = new Date(
        Date.now() + successResponse.expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(successResponse));

      const tokenExchangeResponse = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
      });

      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: sessionToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type:
            'urn:shopify:params:oauth:token-type:online-access-token',
          expiring: '0',
        },
      }).toMatchMadeHttpRequest();

      expect(tokenExchangeResponse.session).toEqual(
        expect.objectContaining({
          accessToken: access_token,
          isOnline: true,
          state: '',
          scope,
          onlineAccessInfo: rest,
        }),
      );

      expect(
        tokenExchangeResponse.session?.expires?.getTime(),
      ).toBeWithinSecondsOf(expectedExpiration, 1);
    });

    test('returns an offline access token', async () => {
      const shopify = shopifyApi(testConfig());
      const sessionToken = await signJWT(
        shopify.config.apiSecretKey,
        sessionTokenPayload,
      );
      const scopes = shopify.config.scopes
        ? shopify.config.scopes.toString()
        : '';
      const successResponse = {
        access_token: 'some access token string',
        scope: scopes,
      };

      queueMockResponse(JSON.stringify(successResponse));

      const tokenExchangeResponse = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });

      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: sessionToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type:
            'urn:shopify:params:oauth:token-type:offline-access-token',
          expiring: '0',
        },
      }).toMatchMadeHttpRequest();

      expect(tokenExchangeResponse.session).toEqual(
        expect.objectContaining({
          accessToken: successResponse.access_token,
          isOnline: false,
          state: '',
          scope: successResponse.scope,
        }),
      );
    });

    test('returns an online access token with expiring=true and refresh token', async () => {
      const shopify = shopifyApi(testConfig());
      const sessionToken = await signJWT(
        shopify.config.apiSecretKey,
        sessionTokenPayload,
      );

      const successResponse = {
        access_token: 'some access token',
        scope: 'pet_kitties, walk_dogs',
        expires_in: 525600,
        associated_user_scope: 'pet_kitties',
        associated_user: {
          id: '8675309',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          email_verified: true,
          account_owner: true,
          locale: 'en',
          collaborator: true,
        },
      };

      const {access_token, scope, ...rest} = successResponse;
      const expectedExpiration = new Date(
        Date.now() + successResponse.expires_in * 1000,
      ).getTime();
      queueMockResponse(JSON.stringify(successResponse));

      const tokenExchangeResponse = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
        expiring: true,
      });

      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: sessionToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type:
            'urn:shopify:params:oauth:token-type:online-access-token',
          expiring: '1',
        },
      }).toMatchMadeHttpRequest();

      expect(tokenExchangeResponse.session).toEqual(
        expect.objectContaining({
          accessToken: access_token,
          isOnline: true,
          state: '',
          scope,
          onlineAccessInfo: rest,
        }),
      );

      expect(
        tokenExchangeResponse.session?.expires?.getTime(),
      ).toBeWithinSecondsOf(expectedExpiration, 1);
    });

    test('returns an offline access token with expiring=true and refresh token', async () => {
      const shopify = shopifyApi(testConfig());
      const sessionToken = await signJWT(
        shopify.config.apiSecretKey,
        sessionTokenPayload,
      );
      const scopes = shopify.config.scopes
        ? shopify.config.scopes.toString()
        : '';
      const successResponse = {
        access_token: 'some access token string',
        scope: scopes,
        expires_in: 525600,
        refresh_token: 'some refresh token',
        refresh_token_expires_in: 2592000,
      };

      const expectedExpiration = new Date(
        Date.now() + successResponse.expires_in * 1000,
      ).getTime();
      const expectedRefreshTokenExpiration = new Date(
        Date.now() + successResponse.refresh_token_expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(successResponse));

      const tokenExchangeResponse = await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
        expiring: true,
      });

      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: sessionToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type:
            'urn:shopify:params:oauth:token-type:offline-access-token',
          expiring: '1',
        },
      }).toMatchMadeHttpRequest();

      expect(tokenExchangeResponse.session).toEqual(
        expect.objectContaining({
          accessToken: successResponse.access_token,
          isOnline: false,
          state: '',
          scope: successResponse.scope,
          refreshToken: successResponse.refresh_token,
        }),
      );

      expect(
        tokenExchangeResponse.session?.expires?.getTime(),
      ).toBeWithinSecondsOf(expectedExpiration, 1);

      expect(
        tokenExchangeResponse.session?.refreshTokenExpires?.getTime(),
      ).toBeWithinSecondsOf(expectedRefreshTokenExpiration, 1);
    });

    test('sends expiring=0 when expiring is explicitly set to false', async () => {
      const shopify = shopifyApi(testConfig());
      const sessionToken = await signJWT(
        shopify.config.apiSecretKey,
        sessionTokenPayload,
      );

      const successResponse = {
        access_token: 'some access token',
        scope: 'pet_kitties, walk_dogs',
        expires_in: 525600,
        associated_user_scope: 'pet_kitties',
        associated_user: {
          id: '8675309',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          email_verified: true,
          account_owner: true,
          locale: 'en',
          collaborator: true,
        },
      };

      queueMockResponse(JSON.stringify(successResponse));

      await shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
        expiring: false,
      });

      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          subject_token: sessionToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
          requested_token_type:
            'urn:shopify:params:oauth:token-type:online-access-token',
          expiring: '0',
        },
      }).toMatchMadeHttpRequest();
    });

    test('throws error when response is bad request', async () => {
      const shopify = shopifyApi(testConfig());
      const sessionToken = await signJWT(
        shopify.config.apiSecretKey,
        sessionTokenPayload,
      );

      const errorResponse = {
        error: 'invalid_subject_token',
        error_description: 'Subject token is invalid',
      };

      queueMockResponse(JSON.stringify(errorResponse), {
        statusCode: 400,
        statusText: 'Bad request',
      });

      const exchangePromise = shopify.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });
      await exchangePromise.catch((error) => {
        expect(error).toHaveProperty('response.body', errorResponse);
      });
      await expect(exchangePromise).rejects.toThrow(
        ShopifyErrors.HttpResponseError,
      );
    });

    describe('with invalid shop', () => {
      beforeEach(() => {
        shop = 'someshop.myspopify.io';
      });

      test('throws InvalidShopError', async () => {
        const shopify = shopifyApi(testConfig());
        const sessionToken = await signJWT(
          shopify.config.apiSecretKey,
          sessionTokenPayload,
        );

        await expect(
          shopify.auth.tokenExchange({
            shop,
            sessionToken,
            requestedTokenType: RequestedTokenType.OnlineAccessToken,
          }),
        ).rejects.toThrow(ShopifyErrors.InvalidShopError);
      });
    });
  });

  describe('with invalid session token', () => {
    test('throws InvalidJwtError', async () => {
      const shopify = shopifyApi(testConfig());

      await expect(
        shopify.auth.tokenExchange({
          shop,
          sessionToken: 'bad-session-token',
          requestedTokenType: RequestedTokenType.OnlineAccessToken,
        }),
      ).rejects.toThrow(ShopifyErrors.InvalidJwtError);
    });
  });
});
