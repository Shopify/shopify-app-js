import fetchMock from 'jest-fetch-mock';
import {
  HttpResponseError,
  LATEST_GLOBAL_API_VERSION,
} from '@shopify/shopify-api';

import {
  mockShopifyResponses,
  shopify,
  TEST_SHOP,
} from '../../__tests__/test-helper';

const TOKEN_URL = 'https://api.shopify.com/auth/access_token';
const EVENTS_URL = `https://api.shopify.com/app/${LATEST_GLOBAL_API_VERSION}/events`;
const EVENT = {
  myshopifyDomain: TEST_SHOP,
  eventHandle: 'onboarding_completed',
  idempotencyKey: 'onboarding-1',
  attributes: {},
};

const TOKEN_1 = {access_token: 'global-token-1', expires_in: 3600};
const TOKEN_2 = {access_token: 'global-token-2', expires_in: 3600};

function eventPostHeaders(callIndex: number): Record<string, string> {
  return fetchMock.mock.calls[callIndex][1]!.headers as Record<string, string>;
}

describe('shopify.appEvents.log', () => {
  test('mints a Global API token and posts the event', async () => {
    mockShopifyResponses(
      [TOKEN_1],
      [{success: true}, {status: 202}],
    );

    await expect(shopify.appEvents.log(EVENT)).resolves.toEqual({
      replayed: false,
    });

    expect({
      method: 'POST',
      url: TOKEN_URL,
      body: {
        client_id: 'testApiKey',
        client_secret: 'testApiSecretKey',
        grant_type: 'client_credentials',
      },
    }).toMatchMadeHttpRequest();
    expect({
      method: 'POST',
      url: EVENTS_URL,
      body: {
        myshopify_domain: TEST_SHOP,
        event_handle: 'onboarding_completed',
      },
    }).toMatchMadeHttpRequest();
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      headers: {Authorization: 'Bearer global-token-1'},
    });
    const body = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(Object.keys(body)).not.toContain('shop' + '_id');

  });
  test('reuses the cached token for a second event', async () => {
    mockShopifyResponses(
      [TOKEN_1],
      [{success: true}, {status: 202}],
      [{success: true}, {status: 202}],
    );

    await shopify.appEvents.log(EVENT);
    await shopify.appEvents.log(EVENT);

    expect(fetchMock.mock.calls).toHaveLength(3);
    expect(fetchMock.mock.calls[2][0]).toBe(EVENTS_URL);
    expect(eventPostHeaders(2).Authorization).toBe('Bearer global-token-1');
  });

  test('coalesces concurrent mints', async () => {
    mockShopifyResponses(
      [TOKEN_1],
      [{success: true}, {status: 202}],
      [{success: true}, {status: 202}],
    );

    await Promise.all([
      shopify.appEvents.log(EVENT),
      shopify.appEvents.log(EVENT),
    ]);

    expect(fetchMock.mock.calls).toHaveLength(3);
  });

  test('mints a new token and retries once after a 401', async () => {
    mockShopifyResponses(
      [TOKEN_1],
      [{error: 'Unauthorized'}, {status: 401}],
      [TOKEN_2],
      [{success: true}, {status: 202}],
    );

    await expect(shopify.appEvents.log(EVENT)).resolves.toEqual({
      replayed: false,
    });

    expect(fetchMock.mock.calls).toHaveLength(4);
    expect(eventPostHeaders(3).Authorization).toBe('Bearer global-token-2');
  });

  test('throws after a second 401', async () => {
    mockShopifyResponses(
      [TOKEN_1],
      [{error: 'Unauthorized'}, {status: 401}],
      [TOKEN_2],
      [{error: 'Unauthorized'}, {status: 401}],
    );

    await expect(shopify.appEvents.log(EVENT)).rejects.toBeInstanceOf(
      HttpResponseError,
    );
    expect(fetchMock.mock.calls).toHaveLength(4);
  });

  test('mints a new token when the cached token is inside the expiry skew', async () => {
    mockShopifyResponses(
      [{access_token: 'global-token-1', expires_in: 30}],
      [{success: true}, {status: 202}],
      [TOKEN_2],
      [{success: true}, {status: 202}],
    );

    await shopify.appEvents.log(EVENT);
    await shopify.appEvents.log(EVENT);

    expect(fetchMock.mock.calls).toHaveLength(4);
    expect(fetchMock.mock.calls[2][0]).toBe(TOKEN_URL);
    expect(eventPostHeaders(3).Authorization).toBe('Bearer global-token-2');
  });

  test('propagates a 409 without retrying', async () => {
    mockShopifyResponses(
      [TOKEN_1],
      [{error: 'Duplicate request in progress'}, {status: 409}],
    );

    await expect(shopify.appEvents.log(EVENT)).rejects.toBeInstanceOf(
      HttpResponseError,
    );
    expect(fetchMock.mock.calls).toHaveLength(2);
  });
});
