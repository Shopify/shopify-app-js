import {mockTestRequests} from '../../../adapters/mock/mock_test_requests';

import {shopifyApi} from '../..';
import {testConfig} from '../../__tests__/test-config';
import {queueMockResponse} from '../../__tests__/test-helper';
import {DataType} from '../../clients/types';
import * as ShopifyErrors from '../../error';
import {ApiVersion, GlobalApiVersion} from '../../types';

import {AppEventInput} from '../types';

function fakeGlobalToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({alg: 'ES256', typ: 'JWT'})}.${encode(claims)}.signature`;
}

function validEvent(overrides: Partial<AppEventInput> = {}): AppEventInput {
  return {
    shopId: 'gid://shopify/Shop/23423423',
    eventHandle: 'onboarding_completed',
    idempotencyKey: 'onboard_23423423_v3',
    attributes: {onboarding_version: 3},
    timestamp: new Date('2026-01-27T14:30:00.000Z'),
    ...overrides,
  };
}

function validToken(offsetSeconds = 3600): string {
  return fakeGlobalToken({
    exp: Math.floor(Date.now() / 1000) + offsetSeconds,
    scopes: 'write_global_api_app_events',
  });
}

function expectTokenRequest(attempts = 1): void {
  expect({
    method: 'POST',
    domain: 'api.shopify.com',
    path: '/auth/access_token',
    attempts,
    data: {
      client_id: 'test_key',
      client_secret: 'test_secret_key',
      grant_type: 'client_credentials',
    },
  }).toMatchMadeHttpRequest();
}

describe('shopify.appEvents.log', () => {
  test('posts a snake_case App Event payload with a string shop ID', async () => {
    const shopify = shopifyApi(testConfig());
    const token = validToken();
    queueMockResponse(JSON.stringify({access_token: token}));
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});
    const result = await shopify.appEvents.log(validEvent());
    expectTokenRequest();
    const eventRequest = mockTestRequests.getRequest();
    expect(eventRequest).toEqual(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.shopify.com/app/2026-07/events',
        headers: expect.objectContaining({
          'Content-Type': [DataType.JSON],
          Authorization: [`Bearer ${token}`],
        }),
      }),
    );
    expect(JSON.parse(eventRequest!.body!)).toEqual({
      shop_id: '23423423',
      event_handle: 'onboarding_completed',
      timestamp: '2026-01-27T14:30:00.000Z',
      idempotency_key: 'onboard_23423423_v3',
      attributes: {onboarding_version: 3},
    });
    expect(result).toEqual({replayed: false});
  });

  test('reuses the Global API token for consecutive events', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({access_token: validToken()}));
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});

    await shopify.appEvents.log(validEvent());
    await shopify.appEvents.log(validEvent({idempotencyKey: 'second-event'}));

    expectTokenRequest();
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/app/2026-07/events',
      data: {shop_id: '23423423'},
      attempts: 2,
    }).toMatchMadeHttpRequest();
  });

  test('refreshes the token once after a 401 response', async () => {
    const shopify = shopifyApi(testConfig());
    const expiredToken = validToken();
    const refreshedToken = validToken(7200);
    queueMockResponse(JSON.stringify({access_token: expiredToken}));
    queueMockResponse(
      JSON.stringify({error: 'Unauthorized', message: 'Token expired'}),
      {statusCode: 401, statusText: 'Unauthorized'},
    );
    queueMockResponse(JSON.stringify({access_token: refreshedToken}));
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});

    await expect(shopify.appEvents.log(validEvent())).resolves.toEqual({
      replayed: false,
    });

    expectTokenRequest();
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/app/2026-07/events',
      headers: {Authorization: `Bearer ${expiredToken}`},
      data: {shop_id: '23423423'},
    }).toMatchMadeHttpRequest();
    expectTokenRequest();
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/app/2026-07/events',
      headers: {Authorization: `Bearer ${refreshedToken}`},
      data: {shop_id: '23423423'},
    }).toMatchMadeHttpRequest();
  });

  test('uses one replacement token for concurrent unauthorized events', async () => {
    const shopify = shopifyApi(testConfig());
    const initialToken = validToken();
    const replacementToken = validToken(7200);
    queueMockResponse(JSON.stringify({access_token: initialToken}));
    queueMockResponse(JSON.stringify({error: 'Unauthorized'}), {
      statusCode: 401,
      statusText: 'Unauthorized',
    });
    queueMockResponse(JSON.stringify({error: 'Unauthorized'}), {
      statusCode: 401,
      statusText: 'Unauthorized',
    });
    queueMockResponse(JSON.stringify({access_token: replacementToken}));
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});

    const results = await Promise.all([
      shopify.appEvents.log(validEvent({idempotencyKey: 'first-event'})),
      shopify.appEvents.log(validEvent({idempotencyKey: 'second-event'})),
    ]);

    expect(results).toEqual([{replayed: false}, {replayed: false}]);
    expectTokenRequest();
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/app/2026-07/events',
      headers: {Authorization: `Bearer ${initialToken}`},
      data: {shop_id: '23423423'},
      attempts: 2,
    }).toMatchMadeHttpRequest();
    expectTokenRequest();
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/app/2026-07/events',
      headers: {Authorization: `Bearer ${replacementToken}`},
      data: {shop_id: '23423423'},
      attempts: 2,
    }).toMatchMadeHttpRequest();
  });

  test('stops after a second 401 response and clears replacement token', async () => {
    const shopify = shopifyApi(testConfig());
    const initialToken = validToken();
    const replacementToken = validToken(7200);
    const nextToken = validToken(10800);
    queueMockResponse(JSON.stringify({access_token: initialToken}));
    queueMockResponse(JSON.stringify({error: 'Unauthorized'}), {
      statusCode: 401,
      statusText: 'Unauthorized',
    });
    queueMockResponse(JSON.stringify({access_token: replacementToken}));
    queueMockResponse(JSON.stringify({error: 'Unauthorized'}), {
      statusCode: 401,
      statusText: 'Unauthorized',
    });

    await expect(shopify.appEvents.log(validEvent())).rejects.toThrow(
      ShopifyErrors.HttpResponseError,
    );

    queueMockResponse(JSON.stringify({access_token: nextToken}));
    const result = await shopify.auth.globalApiClientCredentials();

    expect(result.token.accessToken).toBe(nextToken);
    expectTokenRequest();
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/app/2026-07/events',
      headers: {Authorization: `Bearer ${initialToken}`},
      data: {shop_id: '23423423'},
    }).toMatchMadeHttpRequest();
    expectTokenRequest();
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: '/app/2026-07/events',
      headers: {Authorization: `Bearer ${replacementToken}`},
      data: {shop_id: '23423423'},
    }).toMatchMadeHttpRequest();
    expectTokenRequest();
  });

  test('returns the retry delay with a throttling error', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({access_token: validToken()}));
    queueMockResponse(
      JSON.stringify({success: false, error: 'Rate limit exceeded'}),
      {
        statusCode: 429,
        statusText: 'Too Many Requests',
        headers: {'Retry-After': '30'},
      },
    );

    const error = await shopify.appEvents
      .log(validEvent())
      .catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpThrottlingError);
    expect(error.response.retryAfter).toBe(30);
  });

  test('includes server validation fields in the error message', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({access_token: validToken()}));
    queueMockResponse(
      JSON.stringify({
        success: false,
        error: 'Invalid request',
        errors: [
          {field: 'shop_id', code: 'missing', message: 'shop_id is required'},
        ],
      }),
      {statusCode: 400, statusText: 'Bad Request'},
    );

    const error = await shopify.appEvents
      .log(validEvent())
      .catch((thrown) => thrown);

    expect(error.message).toContain('Invalid request');
    expect(error.message).toContain('shop_id is required');
  });

  test('includes the top-level error string from a 403 response', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({access_token: validToken()}));
    queueMockResponse(
      JSON.stringify({success: false, error: 'Shop not installed'}),
      {statusCode: 403, statusText: 'Forbidden'},
    );

    const error = await shopify.appEvents
      .log(validEvent())
      .catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
    expect(error.message).toContain('Shop not installed');
  });

  test('includes the top-level error string after the 401 retry fails', async () => {
    const shopify = shopifyApi(testConfig());
    const body = JSON.stringify({error: 'Unauthorized'});
    queueMockResponse(JSON.stringify({access_token: validToken()}));
    queueMockResponse(body, {statusCode: 401, statusText: 'Unauthorized'});
    queueMockResponse(JSON.stringify({access_token: validToken(7200)}));
    queueMockResponse(body, {statusCode: 401, statusText: 'Unauthorized'});

    const error = await shopify.appEvents
      .log(validEvent())
      .catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
    expect(error.message).toContain('Unauthorized');
  });

  test('includes the top-level error string with a throttling error', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({access_token: validToken()}));
    queueMockResponse(
      JSON.stringify({success: false, error: 'Rate limit exceeded'}),
      {statusCode: 429, statusText: 'Too Many Requests'},
    );

    const error = await shopify.appEvents
      .log(validEvent())
      .catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpThrottlingError);
    expect(error.message).toContain('Rate limit exceeded');
  });

  test('turns an empty 403 response into HttpResponseError', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({access_token: validToken()}));
    queueMockResponse('', {statusCode: 403, statusText: 'Forbidden'});

    await expect(shopify.appEvents.log(validEvent())).rejects.toBeInstanceOf(
      ShopifyErrors.HttpResponseError,
    );
  });

  test.each(['Idempotent-Replayed', 'Idempotent-Replay'])(
    'reports a replay when Shopify returns the %s header',
    async (headerName) => {
      const shopify = shopifyApi(testConfig());
      queueMockResponse(JSON.stringify({access_token: validToken()}));
      queueMockResponse(JSON.stringify({success: true}), {
        statusCode: 202,
        headers: {[headerName]: 'true'},
      });

      await expect(shopify.appEvents.log(validEvent())).resolves.toEqual({
        replayed: true,
      });
    },
  );

  test.each(Object.values(GlobalApiVersion))(
    'uses the configured Global API route version %s',
    async (globalApiVersion) => {
      const shopify = shopifyApi(
        testConfig({apiVersion: ApiVersion.Unstable, globalApiVersion}),
      );
      queueMockResponse(JSON.stringify({access_token: validToken()}));
      queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});

      await shopify.appEvents.log(validEvent());

      expectTokenRequest();
      expect({
        method: 'POST',
        domain: 'api.shopify.com',
        path: `/app/${globalApiVersion}/events`,
        data: {shop_id: '23423423'},
      }).toMatchMadeHttpRequest();
    },
  );

  test('rejects invalid input before making an HTTP request', async () => {
    const shopify = shopifyApi(testConfig());

    await expect(
      shopify.appEvents.log(validEvent({shopId: 'shop.myshopify.com'})),
    ).rejects.toThrow(ShopifyErrors.InvalidAppEventError);
  });
});
