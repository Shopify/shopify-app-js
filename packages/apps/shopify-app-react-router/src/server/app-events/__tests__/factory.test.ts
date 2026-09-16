import fetchMock from 'jest-fetch-mock';

import {
  API_KEY,
  API_SECRET_KEY,
  mockExternalRequests,
  TEST_SHOP,
  testConfig,
} from '../../__test-helpers';
import {
  HttpResponseError,
  LATEST_GLOBAL_API_VERSION,
} from '@shopify/shopify-api';
import {shopifyApp} from '../../index';


const TOKEN_URL = 'https://api.shopify.com/auth/access_token';
const EVENTS_URL = `https://api.shopify.com/app/${LATEST_GLOBAL_API_VERSION}/events`;

const event = {
  myshopifyDomain: TEST_SHOP,
  eventHandle: 'onboarding_completed',
  idempotencyKey: 'onboarding-1',
  attributes: {},
  timestamp: new Date('2026-01-27T14:30:00.000Z'),
};

const EVENT_BODY = JSON.stringify({
  myshopify_domain: TEST_SHOP,
  event_handle: 'onboarding_completed',
  timestamp: '2026-01-27T14:30:00.000Z',
  idempotency_key: 'onboarding-1',
  attributes: {},
});

function tokenMock(accessToken: string, expiresIn = 3600) {
  return {
    request: new Request(TOKEN_URL, {
      method: 'POST',
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: API_SECRET_KEY,
        grant_type: 'client_credentials',
      }),
    }),
    response: new Response(
      JSON.stringify({access_token: accessToken, expires_in: expiresIn}),
      {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      },
    ),
  };
}

function eventMock(
  status: number,
  body: Record<string, unknown> = {success: true},
) {
  return {
    request: new Request(EVENTS_URL, {
      method: 'POST',
      body: EVENT_BODY,
    }),
    response: new Response(JSON.stringify(body), {
      status,
      headers: {'Content-Type': 'application/json'},
    }),
  };
}

describe('shopify.appEvents.log', () => {
  it('mints a Global API token and posts the event', async () => {
    await mockExternalRequests(tokenMock('global-token-1'), eventMock(202));
    const shopify = shopifyApp(testConfig());

    await expect(shopify.appEvents.log(event)).resolves.toEqual({
      replayed: false,
    });

    expect(fetchMock.mock.calls).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toBe(TOKEN_URL);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: API_SECRET_KEY,
        grant_type: 'client_credentials',
      }),
    });
    expect(fetchMock.mock.calls[1][0]).toBe(EVENTS_URL);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      headers: {Authorization: 'Bearer global-token-1'},
    });
    const body = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(body).toMatchObject({myshopify_domain: TEST_SHOP});
    expect(Object.keys(body)).not.toContain('shop' + '_id');
  });

  it('reuses the cached token for a second event', async () => {
    await mockExternalRequests(
      tokenMock('global-token-1'),
      eventMock(202),
      eventMock(202),
    );
    const shopify = shopifyApp(testConfig());

    await shopify.appEvents.log(event);
    await shopify.appEvents.log(event);

    expect(fetchMock.mock.calls).toHaveLength(3);
    expect(fetchMock.mock.calls[2][0]).toBe(EVENTS_URL);
    expect(fetchMock.mock.calls[2][1]).toMatchObject({
      headers: {Authorization: 'Bearer global-token-1'},
    });
  });

  it('coalesces concurrent mints', async () => {
    await mockExternalRequests(
      tokenMock('global-token-1'),
      eventMock(202),
      eventMock(202),
    );
    const shopify = shopifyApp(testConfig());

    await Promise.all([
      shopify.appEvents.log(event),
      shopify.appEvents.log(event),
    ]);

    expect(fetchMock.mock.calls).toHaveLength(3);
  });

  it('mints a new token and retries once after a 401', async () => {
    await mockExternalRequests(
      tokenMock('global-token-1'),
      eventMock(401, {error: 'Unauthorized'}),
      tokenMock('global-token-2'),
      eventMock(202),
    );
    const shopify = shopifyApp(testConfig());

    await expect(shopify.appEvents.log(event)).resolves.toEqual({
      replayed: false,
    });

    expect(fetchMock.mock.calls).toHaveLength(4);
    expect(fetchMock.mock.calls[3][1]).toMatchObject({
      headers: {Authorization: 'Bearer global-token-2'},
    });
  });

  it('throws after a second 401', async () => {
    await mockExternalRequests(
      tokenMock('global-token-1'),
      eventMock(401, {error: 'Unauthorized'}),
      tokenMock('global-token-2'),
      eventMock(401, {error: 'Unauthorized'}),
    );
    const shopify = shopifyApp(testConfig());

    await expect(shopify.appEvents.log(event)).rejects.toBeInstanceOf(
      HttpResponseError,
    );
    expect(fetchMock.mock.calls).toHaveLength(4);
  });

  it('mints a new token when the cached token is inside the expiry skew', async () => {
    await mockExternalRequests(
      tokenMock('global-token-1', 30),
      eventMock(202),
      tokenMock('global-token-2'),
      eventMock(202),
    );
    const shopify = shopifyApp(testConfig());

    await shopify.appEvents.log(event);
    await shopify.appEvents.log(event);

    expect(fetchMock.mock.calls).toHaveLength(4);
    expect(fetchMock.mock.calls[3][1]).toMatchObject({
      headers: {Authorization: 'Bearer global-token-2'},
    });
  });

  it('propagates a 409 without retrying', async () => {
    await mockExternalRequests(
      tokenMock('global-token-1'),
      eventMock(409, {error: 'Duplicate request in progress'}),
    );
    const shopify = shopifyApp(testConfig());

    await expect(shopify.appEvents.log(event)).rejects.toBeInstanceOf(
      HttpResponseError,
    );
    expect(fetchMock.mock.calls).toHaveLength(2);
  });
});
