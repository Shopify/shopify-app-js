import {executeTokenExchange} from '@shopify/shopify-app-native-spike/transport';

import {JwtPayload, RequestedTokenType, Session, shopifyApi} from '../../..';
import * as Errors from '../../../error';
import {testConfig} from '../../../__tests__/test-config';
import {
  queueError,
  queueMockResponse,
  signJWT,
} from '../../../__tests__/test-helper';

jest.mock('@shopify/shopify-app-native-spike/transport', () => {
  const actual = jest.requireActual<
    typeof import('@shopify/shopify-app-native-spike/transport')
  >('@shopify/shopify-app-native-spike/transport');
  return {
    ...actual,
    executeTokenExchange: jest.fn(actual.executeTokenExchange),
  };
});

const shop = 'test-shop.myshopify.com';
const payload: JwtPayload = {
  iss: `https://${shop}/admin`,
  dest: `https://${shop}`,
  aud: 'test_key',
  sub: '7',
  exp: 9999999999,
  nbf: 1,
  iat: 1,
  jti: 'test-jti',
  sid: 'test-sid',
};

function setup() {
  const api = shopifyApi(testConfig({isEmbeddedApp: true}));
  const exchange = jest.mocked(executeTokenExchange);
  exchange.mockClear();
  return {api, exchange};
}

afterEach(() => jest.restoreAllMocks());

describe('AI Native token exchange compatibility', () => {
  test.each<[RequestedTokenType, boolean | undefined]>([
    [RequestedTokenType.OfflineAccessToken, undefined],
    [RequestedTokenType.OfflineAccessToken, false],
    [RequestedTokenType.OfflineAccessToken, true],
    [RequestedTokenType.OnlineAccessToken, undefined],
    [RequestedTokenType.OnlineAccessToken, false],
    [RequestedTokenType.OnlineAccessToken, true],
  ])(
    'preserves Session and request for %s, expiring=%s',
    async (requestedTokenType, expiring) => {
      const {api, exchange} = setup();
      const sessionToken = await signJWT(api.config.apiSecretKey, payload);
      const online =
        requestedTokenType === RequestedTokenType.OnlineAccessToken;
      const userInfo = {
        expires_in: 3600,
        associated_user_scope: 'read_products',
        associated_user: {
          id: '7',
          first_name: 'Ada',
          future_field: 'preserved',
        },
        future_response_field: 'preserved',
      };
      const offlineInfo = expiring
        ? {
            expires_in: 3600,
            refresh_token: 'refresh-token',
            refresh_token_expires_in: 7200,
          }
        : {};
      const response = {
        access_token: 'access-token',
        scope: 'read_products, write_orders',
        ...(online ? userInfo : offlineInfo),
      };
      queueMockResponse(JSON.stringify(response));

      const {session} = await api.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType,
        expiring,
      });

      expect(exchange).toHaveBeenCalledTimes(1);
      expect(exchange).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: api.config.apiKey,
          clientSecret: api.config.apiSecretKey,
          shopDomain: shop,
          idToken: sessionToken,
          requestedTokenType,
          expiring: expiring ? '1' : '0',
        }),
        expect.any(Function),
      );
      expect(session).toBeInstanceOf(Session);
      expect(session).toMatchObject({
        id: online ? `${shop}_7` : `offline_${shop}`,
        shop,
        state: '',
        isOnline: online,
        accessToken: response.access_token,
        scope: response.scope,
      });
      if (online) {
        expect(session.onlineAccessInfo).toEqual(userInfo);
      } else if (expiring) {
        expect(session.refreshToken).toBe('refresh-token');
        expect(session.refreshTokenExpires).toBeInstanceOf(Date);
      } else {
        expect(session.expires).toBeUndefined();
        expect(session.refreshToken).toBeUndefined();
      }
      if (online || expiring) expect(session.expires).toBeInstanceOf(Date);
    },
  );

  test.each<[string, Partial<JwtPayload>, string | undefined]>([
    ['wrong signature', {}, 'wrong-secret'],
    ['wrong audience', {aud: 'another-app'}, undefined],
    ['expired token', {exp: 1}, undefined],
    ['not yet valid', {nbf: 9999999999}, undefined],
  ])(
    'rejects %s before the core sends HTTP',
    async (_name, overrides, secret) => {
      const {api, exchange} = setup();
      const sessionToken = await signJWT(secret ?? api.config.apiSecretKey, {
        ...payload,
        ...overrides,
      });
      await expect(
        api.auth.tokenExchange({
          shop,
          sessionToken,
          requestedTokenType: RequestedTokenType.OfflineAccessToken,
        }),
      ).rejects.toBeInstanceOf(Errors.InvalidJwtError);
      expect(exchange).not.toHaveBeenCalled();
    },
  );

  test('rejects an invalid shop before sending credentials', async () => {
    const {api, exchange} = setup();
    const sessionToken = await signJWT(api.config.apiSecretKey, payload);
    await expect(
      api.auth.tokenExchange({
        shop: 'attacker.example',
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      }),
    ).rejects.toBeInstanceOf(Errors.InvalidShopError);
    expect(exchange).not.toHaveBeenCalled();
  });

  test.each<[number, typeof Errors.HttpResponseError]>([
    [400, Errors.HttpResponseError],
    [401, Errors.HttpResponseError],
    [429, Errors.HttpThrottlingError],
    [500, Errors.HttpInternalError],
  ])(
    'preserves the SDK error and makes one attempt for HTTP %i',
    async (statusCode, errorType) => {
      const {api, exchange} = setup();
      const sessionToken = await signJWT(api.config.apiSecretKey, payload);
      const body = {
        error: 'invalid_subject_token',
        error_description: 'test error',
      };
      queueMockResponse(JSON.stringify(body), {
        statusCode,
        statusText: 'Test error',
        headers: {'Retry-After': '2', 'X-Request-Id': 'request-id'},
      });
      const promise = api.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      });
      await expect(promise).rejects.toBeInstanceOf(errorType);
      await expect(promise).rejects.toMatchObject({
        response: {code: statusCode, body},
      });
      if (statusCode === 429)
        await expect(promise).rejects.toHaveProperty('response.retryAfter', 2);
      expect(exchange).toHaveBeenCalledTimes(1);
    },
  );

  test('preserves the original network error', async () => {
    const {api, exchange} = setup();
    const sessionToken = await signJWT(api.config.apiSecretKey, payload);
    const error = new TypeError('connection failed');
    queueError(error);
    await expect(
      api.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      }),
    ).rejects.toBe(error);
    expect(exchange).toHaveBeenCalledTimes(1);
  });

  test('preserves JSON parsing failures', async () => {
    const {api} = setup();
    const sessionToken = await signJWT(api.config.apiSecretKey, payload);
    queueMockResponse('<html>Bad Gateway</html>');
    await expect(
      api.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      }),
    ).rejects.toHaveProperty('name', 'SyntaxError');
  });

  test('cannot exchange a token when the shared core is disabled', async () => {
    const {api, exchange} = setup();
    const sessionToken = await signJWT(api.config.apiSecretKey, payload);
    const error = new Error('Shared core disabled');
    exchange.mockRejectedValueOnce(error);
    await expect(
      api.auth.tokenExchange({
        shop,
        sessionToken,
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
      }),
    ).rejects.toBe(error);
    expect(exchange).toHaveBeenCalledTimes(1);
  });

  test('retains custom shop domains supported by the SDK', async () => {
    const {api, exchange} = setup();
    const customShop = 'test-shop.myshopify.io';
    const sessionToken = await signJWT(api.config.apiSecretKey, {
      ...payload,
      dest: `https://${customShop}`,
    });
    queueMockResponse(
      JSON.stringify({access_token: 'token', scope: 'read_products'}),
    );
    const {session} = await api.auth.tokenExchange({
      shop: customShop,
      sessionToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    });
    expect(session.shop).toBe(customShop);
    expect(exchange).toHaveBeenCalledWith(
      expect.objectContaining({shopDomain: customShop}),
      expect.any(Function),
    );
  });
});
