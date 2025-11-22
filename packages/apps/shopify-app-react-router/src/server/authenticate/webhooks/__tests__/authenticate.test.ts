import {Session} from '@shopify/shopify-api';
import {setUpValidSession} from '@shopify/shopify-api/test-helpers';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {shopifyApp} from '../../..';
import {
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  getHmac,
  getThrownResponse,
  mockExternalRequest,
  testConfig,
} from '../../../__test-helpers';
import {AppDistribution} from '../../../types';

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

  describe('Offline token expiration handling', () => {
    describe('with feature flag disabled', () => {
      it('returns expired session without refreshing when feature flag is off', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();
        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
            future: {
              unstable_expiringOfflineAccessTokenSupport: false,
            },
          }),
        );
        const body = {some: 'data'};

        // expired 5 seconds ago
        const expiredSession = setUpValidSession({
          shop: TEST_SHOP,
          expires: new Date(Date.now() - 5000),
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'expired-access-token',
        });
        await sessionStorage.storeSession(expiredSession);

        // WHEN
        const {admin, session: actualSession} =
          await shopify.authenticate.webhook(
            new Request(`${APP_URL}/webhooks`, {
              method: 'POST',
              body: JSON.stringify(body),
              headers: webhookHeaders(JSON.stringify(body)),
            }),
          );

        // THEN
        expect(actualSession).toBeDefined();
        expect(actualSession?.accessToken).toBe('expired-access-token');
        expect(admin).toBeDefined();
      });
    });

    describe('with feature flag enabled', () => {
      it('refreshes expired offline token and returns new session', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();

        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
            distribution: AppDistribution.AppStore,
            future: {
              unstable_expiringOfflineAccessTokenSupport: true,
            },
          }),
        );

        const body = {some: 'data'};

        // expired 5 seconds ago
        const expiredSession = setUpValidSession({
          shop: TEST_SHOP,
          expires: new Date(Date.now() - 5000),
          refreshToken: 'old-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });
        await sessionStorage.storeSession(expiredSession);

        // Mock the refresh token API response
        const refreshResponse = {
          access_token: 'new-access-token',
          scope: 'testScope',
          expires_in: 3600,
          refresh_token: 'new-refresh-token',
          refresh_token_expires_in: 2592000,
        };

        await mockExternalRequest({
          request: new Request(
            `https://${TEST_SHOP}/admin/oauth/access_token`,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                client_id: API_KEY,
                client_secret: API_SECRET_KEY,
                refresh_token: 'old-refresh-token',
              }),
            },
          ),
          response: new Response(JSON.stringify(refreshResponse), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          }),
        });

        // WHEN
        const {admin, session: actualSession} =
          await shopify.authenticate.webhook(
            new Request(`${APP_URL}/webhooks`, {
              method: 'POST',
              body: JSON.stringify(body),
              headers: webhookHeaders(JSON.stringify(body)),
            }),
          );

        // THEN
        expect(actualSession).toBeDefined();
        expect(actualSession?.accessToken).toBe('new-access-token');
        expect(actualSession?.refreshToken).toBe('new-refresh-token');
        expect(admin).toBeDefined();

        // Verify new session was stored
        const storedSession = await sessionStorage.loadSession(
          `offline_${TEST_SHOP}`,
        );
        expect(storedSession?.accessToken).toBe('new-access-token');
      });

      it('refreshes token when expires within threshold (1000ms)', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();

        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
            distribution: AppDistribution.AppStore,
            future: {
              unstable_expiringOfflineAccessTokenSupport: true,
            },
          }),
        );

        const body = {some: 'data'};

        // expires in 900ms
        const almostExpiredSession = setUpValidSession({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 900),
          refreshToken: 'old-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });
        await sessionStorage.storeSession(almostExpiredSession);

        // Mock the refresh token API response
        const refreshResponse = {
          access_token: 'new-access-token',
          scope: 'testScope',
          expires_in: 3600,
          refresh_token: 'new-refresh-token',
          refresh_token_expires_in: 2592000,
        };

        await mockExternalRequest({
          request: new Request(
            `https://${TEST_SHOP}/admin/oauth/access_token`,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                client_id: API_KEY,
                client_secret: API_SECRET_KEY,
                refresh_token: 'old-refresh-token',
              }),
            },
          ),
          response: new Response(JSON.stringify(refreshResponse), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          }),
        });

        // WHEN
        const {session: actualSession} = await shopify.authenticate.webhook(
          new Request(`${APP_URL}/webhooks`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: webhookHeaders(JSON.stringify(body)),
          }),
        );

        // THEN
        expect(actualSession?.accessToken).toBe('new-access-token');
        expect(actualSession?.refreshToken).toBe('new-refresh-token');
      });

      it('does not refresh token when not expired', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();

        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
            distribution: AppDistribution.AppStore,
            future: {
              unstable_expiringOfflineAccessTokenSupport: true,
            },
          }),
        );

        const body = {some: 'data'};

        // 24 hours from now
        const validSession = setUpValidSession({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 86400000),
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'valid-access-token',
        });
        await sessionStorage.storeSession(validSession);

        // WHEN
        const {session: actualSession} = await shopify.authenticate.webhook(
          new Request(`${APP_URL}/webhooks`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: webhookHeaders(JSON.stringify(body)),
          }),
        );

        // THEN
        expect(actualSession?.accessToken).toBe('valid-access-token');
        expect(actualSession?.refreshToken).toBe('test-refresh-token');
      });

      it('handles session with undefined expires without refreshing', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();

        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
            distribution: AppDistribution.AppStore,
            future: {
              unstable_expiringOfflineAccessTokenSupport: true,
            },
          }),
        );

        const body = {some: 'data'};

        const sessionWithoutExpiry = setUpValidSession({
          shop: TEST_SHOP,
          expires: undefined,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'test-access-token',
        });
        await sessionStorage.storeSession(sessionWithoutExpiry);

        // WHEN
        const {session: actualSession} = await shopify.authenticate.webhook(
          new Request(`${APP_URL}/webhooks`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: webhookHeaders(JSON.stringify(body)),
          }),
        );

        // THEN
        expect(actualSession?.accessToken).toBe('test-access-token');
        expect(actualSession?.refreshToken).toBe('test-refresh-token');
      });
    });
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
