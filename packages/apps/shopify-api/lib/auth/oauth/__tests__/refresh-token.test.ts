import {shopifyApi} from '../../..';
import {testConfig} from '../../../__tests__/test-config';
import {queueMockResponse} from '../../../__tests__/test-helper';
import {DataType} from '../../../clients/types';
import * as ShopifyErrors from '../../../error';

jest.useFakeTimers().setSystemTime(new Date('2023-11-11'));

describe('refreshToken', () => {
  const shop = 'test-shop.myshopify.io';
  const refreshTokenValue = 'test-refresh-token';

  describe('with valid parameters', () => {
    test('returns a new session with refreshed access token and expiry for offline token with expiry', async () => {
      const shopify = shopifyApi(testConfig());
      const scopes = shopify.config.scopes
        ? shopify.config.scopes.toString()
        : '';

      const successResponse = {
        access_token: 'new_access_token',
        scope: scopes,
        expires_in: 525600,
        refresh_token: 'new_refresh_token',
        refresh_token_expires_in: 2592000,
      };

      const expectedExpiration = new Date(
        Date.now() + successResponse.expires_in * 1000,
      ).getTime();
      const expectedRefreshTokenExpiration = new Date(
        Date.now() + successResponse.refresh_token_expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(successResponse));

      const result = await shopify.auth.refreshToken({
        shop,
        refreshToken: refreshTokenValue,
      });

      // Verify the request was made with correct parameters
      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          'Content-Type': DataType.JSON,
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          refresh_token: refreshTokenValue,
        },
      }).toMatchMadeHttpRequest();

      // Verify the response contains expected session data
      expect(result.session).toEqual(
        expect.objectContaining({
          id: `offline_${shop}`,
          shop,
          isOnline: false,
          state: '',
          accessToken: successResponse.access_token,
          scope: successResponse.scope,
          refreshToken: successResponse.refresh_token,
        }),
      );

      expect(result.session.expires?.getTime()).toBeWithinSecondsOf(
        expectedExpiration,
        1,
      );
      expect(result.session.refreshTokenExpires?.getTime()).toBeWithinSecondsOf(
        expectedRefreshTokenExpiration,
        1,
      );
    });

    test('returns a new session with refreshed access token for online token', async () => {
      const shopify = shopifyApi(testConfig({isEmbeddedApp: true}));
      const scopes = shopify.config.scopes
        ? shopify.config.scopes.toString()
        : '';

      const onlineAccessInfo = {
        expires_in: 525600,
        associated_user_scope: 'pet_kitties',
        associated_user: {
          id: 8675309,
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          email_verified: true,
          account_owner: true,
          locale: 'en',
          collaborator: true,
        },
      };

      const successResponse = {
        access_token: 'new_access_token',
        scope: scopes,
        ...onlineAccessInfo,
      };

      const expectedExpiration = new Date(
        Date.now() + onlineAccessInfo.expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(successResponse));

      const result = await shopify.auth.refreshToken({
        shop,
        refreshToken: refreshTokenValue,
      });

      // Verify the request was made with correct parameters
      expect({
        method: 'POST',
        domain: shop,
        path: '/admin/oauth/access_token',
        headers: {
          'Content-Type': DataType.JSON,
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
        },
      }).toMatchMadeHttpRequest();

      // Verify the response contains expected session data
      expect(result.session).toEqual(
        expect.objectContaining({
          id: `${shop}_${onlineAccessInfo.associated_user.id}`,
          shop,
          isOnline: true,
          state: '',
          accessToken: successResponse.access_token,
          scope: successResponse.scope,
          onlineAccessInfo,
        }),
      );

      expect(result.session.expires?.getTime()).toBeWithinSecondsOf(
        expectedExpiration,
        1,
      );
    });

    test('sanitizes shop domain from admin URL format before making request', async () => {
      const shopify = shopifyApi(testConfig());
      const scopes = shopify.config.scopes
        ? shopify.config.scopes.toString()
        : '';

      const successResponse = {
        access_token: 'new_access_token',
        scope: scopes,
      };

      queueMockResponse(JSON.stringify(successResponse));

      // Using admin URL format to test sanitization
      await shopify.auth.refreshToken({
        shop: 'admin.myshopify.com/store/test-shop',
        refreshToken: refreshTokenValue,
      });

      // Verify the request was made with sanitized shop domain
      expect({
        method: 'POST',
        domain: 'test-shop.myshopify.com',
        path: '/admin/oauth/access_token',
        headers: {
          'Content-Type': DataType.JSON,
          Accept: DataType.JSON,
        },
        data: {
          client_id: shopify.config.apiKey,
          client_secret: shopify.config.apiSecretKey,
          refresh_token: refreshTokenValue,
        },
      }).toMatchMadeHttpRequest();
    });
  });

  describe('error handling', () => {
    test('throws error when response is not successful', async () => {
      const shopify = shopifyApi(testConfig());

      const errorResponse = {
        error: 'invalid_grant',
        error_description: 'The refresh token is invalid or expired',
      };

      queueMockResponse(JSON.stringify(errorResponse), {
        statusCode: 400,
        statusText: 'Bad Request',
      });

      await expect(
        shopify.auth.refreshToken({
          shop,
          refreshToken: refreshTokenValue,
        }),
      ).rejects.toThrow(ShopifyErrors.HttpResponseError);
    });

    test('throws error when shop is invalid', async () => {
      const shopify = shopifyApi(testConfig());

      await expect(
        shopify.auth.refreshToken({
          shop: 'invalid-shop',
          refreshToken: refreshTokenValue,
        }),
      ).rejects.toThrow();
    });
  });
});
