import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {shopifyApp} from '../../..';
import {
  expectAdminApiClient,
  getHmac,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../__test-helpers';

const FLOW_URL = 'https://example.myapp.io/authenticate/flow';

describe('authenticating flow requests', () => {
  it('throws a 405 response if the request method is not POST', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.flow,
      new Request(FLOW_URL, {method: 'GET'}),
    );

    // THEN
    expect(response.status).toBe(405);
    expect(response.statusText).toBe('Method not allowed');
  });

  it('throws a 400 response if the is missing the HMAC signature', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.flow,
      new Request(FLOW_URL, {method: 'POST'}),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  it('throws a 400 response if the request has an invalid HMAC signature', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.flow,
      new Request(FLOW_URL, {
        method: 'POST',
        headers: {
          'X-Shopify-Hmac-Sha256': 'not-the-right-signature',
        },
      }),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  it('throws a 400 response if there is no session for the shop', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const body = {shopify_domain: 'not-the-right-shop.myshopify.io'};

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.flow,
      new Request(FLOW_URL, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
          'X-Shopify-Hmac-Sha256': getHmac(JSON.stringify(body)),
        },
      }),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  it('valid requests with a session succeed', async () => {
    // GIVEN
    const sessionStorage = new MemorySessionStorage();
    const shopify = shopifyApp(testConfig({sessionStorage}));

    const {
      request,
      body,
      session: expectedSession,
    } = await getValidRequest(sessionStorage);

    // WHEN
    const {payload, session} = await shopify.authenticate.flow(request);

    // THEN
    expect(session).toEqual(expectedSession);
    expect(payload).toEqual(body);
  });

  describe('valid requests include an API client object', () => {
    expectAdminApiClient(async () => {
      const sessionStorage = new MemorySessionStorage();
      const shopify = shopifyApp(testConfig({sessionStorage}));

      const {request, session: expectedSession} =
        await getValidRequest(sessionStorage);

      const {admin, session: actualSession} =
        await shopify.authenticate.flow(request);

      if (!admin) {
        throw new Error('No admin client');
      }

      return {admin, expectedSession, actualSession};
    });
  });
});

async function getValidRequest(sessionStorage: SessionStorage) {
  const session = await setUpValidSession(sessionStorage, {isOnline: false});

  const body = {shopify_domain: session.shop};
  const bodyString = JSON.stringify(body);

  const request = new Request(FLOW_URL, {
    body: bodyString,
    method: 'POST',
    headers: {
      'X-Shopify-Hmac-Sha256': getHmac(bodyString),
    },
  });

  return {body, request, session};
}
