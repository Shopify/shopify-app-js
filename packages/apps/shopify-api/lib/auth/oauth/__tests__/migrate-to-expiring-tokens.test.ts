import * as ShopifyErrors from '../../../error';
import {DataType, shopifyApi} from '../../..';
import {testConfig} from '../../../__tests__/test-config';
import {queueMockResponse} from '../../../__tests__/test-helper';
import {LogSeverity} from '../../../types';
import {RequestedTokenType} from '../token-exchange';

let shop: string;
let nonExpiringOfflineAccessToken: string;

beforeEach(() => {
  shop = 'someshop.myshopify.io';
  nonExpiringOfflineAccessToken = 'some-access-token';
});

describe('migrateToExpiringToken', () => {
  describe('with valid parameters', () => {
    test('returns a session with expiring access token', async () => {
      const shopify = shopifyApi(testConfig());
      const scopes = shopify.config.scopes
        ? shopify.config.scopes.toString()
        : '';

      const successResponse = {
        access_token: 'new_access_token',
        scope: scopes,
        expires_in: 525600,
        refresh_token: 'some_refresh_token',
        refresh_token_expires_in: 2592000,
      };

      const expectedExpiration = new Date(
        Date.now() + successResponse.expires_in * 1000,
      ).getTime();
      const expectedRefreshTokenExpiration = new Date(
        Date.now() + successResponse.refresh_token_expires_in * 1000,
      ).getTime();

      queueMockResponse(JSON.stringify(successResponse));

      const response = await shopify.auth.migrateToExpiringToken({
        shop,
        nonExpiringOfflineAccessToken,
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
          subject_token: nonExpiringOfflineAccessToken,
          subject_token_type: RequestedTokenType.OfflineAccessToken,
          requested_token_type: RequestedTokenType.OfflineAccessToken,
          expiring: '1',
        },
      }).toMatchMadeHttpRequest();

      expect(response.session).toEqual(
        expect.objectContaining({
          accessToken: successResponse.access_token,
          scope: successResponse.scope,
          refreshToken: successResponse.refresh_token,
        }),
      );

      expect(response.session?.expires?.getTime()).toBeWithinSecondsOf(
        expectedExpiration,
        1,
      );

      expect(
        response.session?.refreshTokenExpires?.getTime(),
      ).toBeWithinSecondsOf(expectedRefreshTokenExpiration, 1);
    });

    test('throws error when response is bad request', async () => {
      const shopify = shopifyApi(testConfig());

      const errorResponse = {
        error: 'invalid_request',
        error_description: 'Invalid subject token',
      };

      queueMockResponse(JSON.stringify(errorResponse), {
        statusCode: 400,
        statusText: 'Bad request',
      });

      const exchangePromise = shopify.auth.migrateToExpiringToken({
        shop,
        nonExpiringOfflineAccessToken,
      });

      exchangePromise.catch((error) => {
        expect(error).toHaveProperty('response.body', errorResponse);
      });
      await expect(exchangePromise).rejects.toThrow(
        ShopifyErrors.HttpResponseError,
      );
    });

    test.each([
      ['one trailing slash', '/'],
      ['several trailing slashes', '///'],
    ])(
      'does not log the secret or the access token when the shop has %s',
      async (_label, trailingSlashes) => {
        const logFn = jest.fn();
        const shopify = shopifyApi(
          testConfig({
            logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
          }),
        );
        queueMockResponse(
          JSON.stringify({access_token: 'new_access_token', scope: ''}),
        );

        await shopify.auth.migrateToExpiringToken({
          shop: `${shop}${trailingSlashes}`,
          nonExpiringOfflineAccessToken,
        });

        const messages = logFn.mock.calls.map(
          ([_severity, message]) => message,
        );
        expect(
          messages.some((message) => message.includes('Making HTTP request')),
        ).toBe(true);
        messages.forEach((message) => {
          expect(message).not.toContain(shopify.config.apiSecretKey);
          expect(message).not.toContain(nonExpiringOfflineAccessToken);
        });
      },
    );

    test('does not log the secret or the access token when a domain transformation adds a path to the shop', async () => {
      const logFn = jest.fn();
      const shopify = shopifyApi(
        testConfig({
          logger: {log: logFn, level: LogSeverity.Debug, httpRequests: true},
          domainTransformations: [
            {
              match: /^([a-zA-Z0-9][a-zA-Z0-9-_]*)\.myshopify\.io$/,
              transform: '$1.myshopify.io/proxy',
            },
          ],
        }),
      );
      queueMockResponse(
        JSON.stringify({access_token: 'new_access_token', scope: ''}),
      );

      await expect(
        shopify.auth.migrateToExpiringToken({
          shop,
          nonExpiringOfflineAccessToken,
        }),
      ).rejects.toThrow(ShopifyErrors.InvalidShopError);

      expect({
        method: 'POST',
        domain: shop,
        path: '/proxy/admin/oauth/access_token',
        data: {client_secret: shopify.config.apiSecretKey},
      }).toMatchMadeHttpRequest();
      const messages = logFn.mock.calls.map(([_severity, message]) => message);
      expect(
        messages.some((message) => message.includes('Making HTTP request')),
      ).toBe(true);
      messages.forEach((message) => {
        expect(message).not.toContain(shopify.config.apiSecretKey);
        expect(message).not.toContain(nonExpiringOfflineAccessToken);
      });
    });

    describe('with invalid shop', () => {
      beforeEach(() => {
        shop = 'someshop.myspopify.io';
      });

      test('throws InvalidShopError', async () => {
        const shopify = shopifyApi(testConfig());

        await expect(
          shopify.auth.migrateToExpiringToken({
            shop,
            nonExpiringOfflineAccessToken,
          }),
        ).rejects.toThrow(ShopifyErrors.InvalidShopError);
      });
    });
  });
});
