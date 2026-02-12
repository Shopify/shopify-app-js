import {Session} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {shopifyApp} from '../../..';
import {
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  expectTokenRefresh,
  getHmac,
  getThrownResponse,
  testConfig,
} from '../../../__test-helpers';
import {TestOverridesArg} from '../../../test-helpers/test-config';

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
    const shopify = shopifyApp(testConfig({sessionStorage}));
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
      const shopify = shopifyApp(testConfig({sessionStorage}));
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

      return {admin, expectedSession, actualSession};
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

  describe('Events webhook validation', () => {
    it('returns context with events fields when there is no session', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const shopify = shopifyApp(testConfig({sessionStorage}));
      const body = {some: 'data'};
      const bodyString = JSON.stringify(body);

      // WHEN
      const result = await shopify.authenticate.webhook(
        new Request(`${APP_URL}/webhooks`, {
          method: 'POST',
          body: bodyString,
          headers: eventsWebhookHeaders(bodyString),
        }),
      );

      // THEN
      expect(result.webhookType).toBe('events');
      expect(result.apiVersion).toBe('2023-01');
      expect(result.shop).toBe(TEST_SHOP);
      expect(result.topic).toBe('PRODUCT');
      expect(result.webhookId).toBe('evt-123');
      expect(result.eventId).toBe('evt-123');
      expect(result.handle).toBe('my-handle');
      expect(result.action).toBe('update');
      expect(result.resourceId).toBe('gid://shopify/Product/123');
      expect(result.triggeredAt).toBe('2026-01-27T12:00:00Z');
      expect(result.payload).toEqual(body);

      expect(result.admin).toBeUndefined();
      expect(result.session).toBeUndefined();
    });

    it('returns webhookType webhooks for traditional webhooks', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const shopify = shopifyApp(testConfig({sessionStorage}));
      const body = {some: 'data'};

      // WHEN
      const result = await shopify.authenticate.webhook(
        new Request(`${APP_URL}/webhooks`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: webhookHeaders(JSON.stringify(body)),
        }),
      );

      // THEN
      expect(result.webhookType).toBe('webhooks');
    });

    it('throws a 401 on invalid events HMAC', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.webhook,
        new Request(`${APP_URL}/webhooks`, {
          method: 'POST',
          body: JSON.stringify({}),
          headers: eventsWebhookHeaders(JSON.stringify({}), {
            'shopify-hmac-sha256': 'invalid_hmac',
            'X-Shopify-Hmac-Sha256': 'invalid_hmac',
          }),
        }),
      );

      // THEN
      expect(response.status).toBe(401);
    });
  });

  describe('Offline token expiration handling', () => {
    expectTokenRefresh(
      async (
        sessionStorage: SessionStorage,
        session: Session,
        configOverrides: TestOverridesArg,
      ) => {
        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
            ...configOverrides,
          }) as any,
        );

        const body = {some: 'data'};
        const bodyString = JSON.stringify(body);

        const request = new Request(`${APP_URL}/webhooks`, {
          method: 'POST',
          body: bodyString,
          headers: webhookHeaders(bodyString),
        });

        const {session: actualSession} =
          await shopify.authenticate.webhook(request);

        if (!actualSession) {
          throw new Error('No session returned from webhook authentication');
        }

        return actualSession;
      },
    );
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

function eventsWebhookHeaders(
  body: string,
  overrides: Record<string, string> = {},
): Record<string, string> {
  const hmac = getHmac(body);
  return {
    'X-Shopify-Shop-Domain': TEST_SHOP,
    'X-Shopify-Topic': 'Product',
    'X-Shopify-API-Version': '2023-01',
    'X-Shopify-Webhook-Id': 'evt-123',
    'X-Shopify-Hmac-Sha256': hmac,
    // New shopify-* headers
    'shopify-shop-domain': TEST_SHOP,
    'shopify-topic': 'Product',
    'shopify-api-version': '2023-01',
    'shopify-hmac-sha256': hmac,
    'shopify-event-id': 'evt-123',
    'shopify-handle': 'my-handle',
    'shopify-action': 'update',
    'shopify-resource-id': 'gid://shopify/Product/123',
    'shopify-triggered-at': '2026-01-27T12:00:00Z',
    ...overrides,
  };
}
