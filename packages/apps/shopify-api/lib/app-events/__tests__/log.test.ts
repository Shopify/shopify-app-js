import {mockTestRequests} from '../../../adapters/mock/mock_test_requests';

import {shopifyApi} from '../..';
import {testConfig} from '../../__tests__/test-config';
import {queueMockResponse} from '../../__tests__/test-helper';
import {DataType} from '../../clients/types';
import * as ShopifyErrors from '../../error';
import {ApiVersion, GlobalApiVersion, LATEST_GLOBAL_API_VERSION} from '../../types';

import {AppEventLogParams} from '../types';

const TEST_ACCESS_TOKEN = 'test-global-access-token';

function validEvent(
  overrides: Partial<AppEventLogParams> = {},
): AppEventLogParams {
  return {
    accessToken: TEST_ACCESS_TOKEN,
    myshopifyDomain: 'test-shop.myshopify.io',
    eventHandle: 'onboarding_completed',
    idempotencyKey: 'onboard_23423423_v3',
    attributes: {onboarding_version: 3},
    timestamp: new Date('2026-01-27T14:30:00.000Z'),
    ...overrides,
  };
}

describe('shopify.appEvents.log', () => {
  test('posts a snake_case App Event with the given access token', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});

    const result = await shopify.appEvents.log(validEvent());
    const eventRequest = mockTestRequests.getRequest();

    expect(eventRequest).toEqual(
      expect.objectContaining({
        method: 'POST',
        url: `https://api.shopify.com/app/${LATEST_GLOBAL_API_VERSION}/events`,
        headers: expect.objectContaining({
          'Content-Type': [DataType.JSON],
          Authorization: [`Bearer ${TEST_ACCESS_TOKEN}`],
        }),
      }),
    );
    expect(JSON.parse(eventRequest!.body!)).toEqual({
      myshopify_domain: 'test-shop.myshopify.io',
      event_handle: 'onboarding_completed',
      timestamp: '2026-01-27T14:30:00.000Z',
      idempotency_key: 'onboard_23423423_v3',
      attributes: {onboarding_version: 3},
    });
    expect(result).toEqual({replayed: false});
  });

  test('returns a throttling error with the retry delay', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(
      JSON.stringify({success: false, error: 'Rate limit exceeded'}),
      {statusCode: 429, statusText: 'Too Many Requests', headers: {'Retry-After': '30'}},
    );

    const error = await shopify.appEvents.log(validEvent()).catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpThrottlingError);
    expect(error.response.retryAfter).toBe(30);
  });

  test('includes server validation fields in the error message', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(
      JSON.stringify({
        success: false,
        error: 'Invalid request',
        errors: [
          {field: 'myshopify_domain', code: 'missing', message: 'myshopify_domain is required'},
        ],
      }),
      {statusCode: 400, statusText: 'Bad Request'},
    );

    const error = await shopify.appEvents.log(validEvent()).catch((thrown) => thrown);

    expect(error.message).toContain('Invalid request');
    expect(error.message).toContain('myshopify_domain is required');
  });

  test('includes the top-level error string from a 403 response', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({success: false, error: 'Shop not installed'}), {
      statusCode: 403,
      statusText: 'Forbidden',
    });

    const error = await shopify.appEvents.log(validEvent()).catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
    expect(error.message).toContain('Shop not installed');
  });

  test('turns an empty 403 response into HttpResponseError', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse('', {statusCode: 403, statusText: 'Forbidden'});

    await expect(shopify.appEvents.log(validEvent())).rejects.toBeInstanceOf(
      ShopifyErrors.HttpResponseError,
    );
  });

  test('throws HttpResponseError on 401 without minting or retrying', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({error: 'Unauthorized'}), {
      statusCode: 401,
      statusText: 'Unauthorized',
    });

    await expect(shopify.appEvents.log(validEvent())).rejects.toBeInstanceOf(
      ShopifyErrors.HttpResponseError,
    );
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: `/app/${LATEST_GLOBAL_API_VERSION}/events`,
      data: {myshopify_domain: 'test-shop.myshopify.io'},
    }).toMatchMadeHttpRequest();
    expect(mockTestRequests.getRequest()).toBeUndefined();
  });

  test('throws HttpResponseError on 409 without retrying', async () => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({success: false, error: 'Duplicate request in progress'}), {
      statusCode: 409,
      statusText: 'Conflict',
      headers: {'Retry-After': '0'},
    });

    const error = await shopify.appEvents.log(validEvent()).catch((thrown) => thrown);

    expect(error).toBeInstanceOf(ShopifyErrors.HttpResponseError);
    expect(error.message).toContain('Duplicate request in progress');
    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: `/app/${LATEST_GLOBAL_API_VERSION}/events`,
      data: {myshopify_domain: 'test-shop.myshopify.io'},
    }).toMatchMadeHttpRequest();
    expect(mockTestRequests.getRequest()).toBeUndefined();
  });

  test.each(['false', ''])('does not report a replay for a falsey %s header', async (headerValue) => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({success: true}), {
      statusCode: 202,
      headers: {'Idempotent-Replayed': headerValue},
    });

    await expect(shopify.appEvents.log(validEvent())).resolves.toEqual({replayed: false});
  });

  test.each(['Idempotent-Replayed', 'Idempotent-Replay'])('reports a replay for the %s header', async (headerName) => {
    const shopify = shopifyApi(testConfig());
    queueMockResponse(JSON.stringify({success: true}), {
      statusCode: 202,
      headers: {[headerName]: 'true'},
    });

    await expect(shopify.appEvents.log(validEvent())).resolves.toEqual({replayed: true});
  });

  test.each(Object.values(GlobalApiVersion))('uses the configured Global API route version %s', async (globalApiVersion) => {
    const shopify = shopifyApi(testConfig({apiVersion: ApiVersion.Unstable, globalApiVersion}));
    queueMockResponse(JSON.stringify({success: true}), {statusCode: 202});

    await shopify.appEvents.log(validEvent());

    expect({
      method: 'POST',
      domain: 'api.shopify.com',
      path: `/app/${globalApiVersion}/events`,
      data: {myshopify_domain: 'test-shop.myshopify.io'},
    }).toMatchMadeHttpRequest();
  });

  test('rejects invalid input before making an HTTP request', async () => {
    const shopify = shopifyApi(testConfig());

    await expect(
      shopify.appEvents.log(validEvent({myshopifyDomain: 'shop.invalid'})),
    ).rejects.toThrow(ShopifyErrors.InvalidAppEventError);
    expect(mockTestRequests.getRequest()).toBeUndefined();
  });

  test('rejects an empty accessToken before making an HTTP request', async () => {
    const shopify = shopifyApi(testConfig());

    await expect(
      shopify.appEvents.log(validEvent({accessToken: ''})),
    ).rejects.toThrow(ShopifyErrors.InvalidAppEventError);
    expect(mockTestRequests.getRequest()).toBeUndefined();
  });
});
