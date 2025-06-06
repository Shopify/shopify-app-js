import {Session} from '@shopify/shopify-api';
import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {shopifyApp} from '../../..';
import {
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  getHmac,
  getThrownResponse,
  testConfig,
} from '../../../__test-helpers';

interface WebhookHeaders {
  [key: string]: string;
  'X-Shopify-Shop-Domain': string;
  'X-Shopify-Topic': string;
  'X-Shopify-API-Version': string;
  'X-Shopify-Webhook-Id': string;
  'X-Shopify-Hmac-Sha256': string;
}

describe('Webhook validation', () => {
  it('returns context when there is no session', async () => {
    // GIVEN
    const sessionStorage = new MemorySessionStorage();
    const shopify = shopifyApp(testConfig({sessionStorage, restResources}));
    const body = {some: 'data'};

    // WHEN
    const {
      admin,
      apiVersion,
      session: actualSession,
      shop,
      topic,
      webhookId,
      payload,
    } = await shopify.authenticate.webhook(
      new Request(`${APP_URL}/webhooks`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: webhookHeaders(JSON.stringify(body)),
      }),
    );

    // THEN
    expect(apiVersion).toBe('2023-01');
    expect(shop).toBe(TEST_SHOP);
    expect(topic).toBe('APP_UNINSTALLED');
    expect(webhookId).toBe('1234567890');
    expect(payload).toEqual(body);

    expect(admin).toBeUndefined();
    expect(actualSession).toBeUndefined();
  });

  describe('returns context with session when there is a session', () => {
    expectAdminApiClient(async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const shopify = shopifyApp({
        ...testConfig({sessionStorage, restResources}),
        future: {removeRest: false},
      });
      const body = {some: 'data'};

      const expectedSession = new Session({
        id: `offline_${TEST_SHOP}`,
        shop: TEST_SHOP,
        isOnline: false,
        state: 'test',
        accessToken: 'totally_real_token',
      });
      await sessionStorage.storeSession(expectedSession);

      const requestURL = `${APP_URL}/webhooks`;
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: webhookHeaders(JSON.stringify(body)),
      };

      // WHEN
      const {
        admin,
        apiVersion,
        session: actualSession,
        shop,
        topic,
        webhookId,
        payload,
      } = await shopify.authenticate.webhook(
        new Request(requestURL, requestOptions),
      );

      // THEN
      expect(apiVersion).toBe('2023-01');
      expect(shop).toBe(TEST_SHOP);
      expect(topic).toBe('APP_UNINSTALLED');
      expect(webhookId).toBe('1234567890');
      expect(actualSession).toBe(expectedSession);
      expect(payload).toEqual(body);

      if (!admin) throw new Error('Expected admin to be defined');
      if (!actualSession) throw new Error('Expected session to be defined');

      const shopifyWithoutRest = shopifyApp({
        ...testConfig({sessionStorage, restResources}),
        future: {removeRest: true},
      });

      const {admin: adminWithoutRest} =
        await shopifyWithoutRest.authenticate.webhook(
          new Request(requestURL, requestOptions),
        );

      return {admin, adminWithoutRest, expectedSession, actualSession};
    });
  });

  it('throws a 401 on invalid HMAC', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.webhook,
      new Request(`${APP_URL}/webhooks`, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: webhookHeaders(JSON.stringify({}), {
          'X-Shopify-Hmac-Sha256': 'invalid_hmac',
        }),
      }),
    );

    // THEN
    expect(response.status).toBe(401);
  });

  it.each([
    'X-Shopify-Shop-Domain',
    'X-Shopify-Topic',
    'X-Shopify-API-Version',
    'X-Shopify-Webhook-Id',
    'X-Shopify-Hmac-Sha256',
  ])('throws a 400 when header %s is missing', async (header) => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.webhook,
      new Request(`${APP_URL}/webhooks`, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: webhookHeaders(JSON.stringify({}), {[header]: ''}),
      }),
    );

    // THEN
    expect(response.status).toBe(400);
  });

  it('throws a 405 Method Not Allowed on non-POST requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.webhook,
      new Request(`${APP_URL}/webhooks`, {
        method: 'GET',
        headers: webhookHeaders(JSON.stringify({})),
      }),
    );

    // THEN
    expect(response.status).toBe(405);
  });
});

function webhookHeaders(
  body: string,
  overrides: Partial<WebhookHeaders> = {},
): WebhookHeaders {
  return {
    'X-Shopify-Shop-Domain': TEST_SHOP,
    'X-Shopify-Topic': 'app/uninstalled',
    'X-Shopify-API-Version': '2023-01',
    'X-Shopify-Webhook-Id': '1234567890',
    'X-Shopify-Hmac-Sha256': getHmac(body),
    ...overrides,
  };
}
