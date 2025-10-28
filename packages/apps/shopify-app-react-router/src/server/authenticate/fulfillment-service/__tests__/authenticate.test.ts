import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';
import {Session} from '@shopify/shopify-api';

import {AppDistribution, shopifyApp} from '../../..';
import {
  API_KEY,
  API_SECRET_KEY,
  expectAdminApiClient,
  getHmac,
  getThrownResponse,
  mockExternalRequest,
  setUpValidSession,
  TEST_SHOP,
  testConfig,
} from '../../../__test-helpers';

const FULFILLMENT_URL =
  'https://example.myapp.io/authenticate/fulfillment_order_notification';

const MERCHANT_CUSTOM_APP_CONFIG = {
  distribution: AppDistribution.ShopifyAdmin,
  adminApiAccessToken: 'shpat_accesstoken',
  sessionStorage: undefined,
};

[true, false].forEach((isMerchantCustomApp) => {
  const isCustomApp = isMerchantCustomApp ? 'Merchant Custom App' : 'Public';
  describe(`authenticating fulfillment service notification requests for ${isCustomApp}`, () => {
    it('throws a 405 response if the request method is not POST', async () => {
      // GIVEN
      const config = isMerchantCustomApp ? MERCHANT_CUSTOM_APP_CONFIG : {};
      const shopify = shopifyApp(testConfig(config));

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.fulfillmentService,
        new Request(FULFILLMENT_URL, {method: 'GET'}),
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
        shopify.authenticate.fulfillmentService,
        new Request(FULFILLMENT_URL, {method: 'POST'}),
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
        shopify.authenticate.fulfillmentService,
        new Request(FULFILLMENT_URL, {
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
      const body = {kind: 'FULFILLMENT_REQUEST'};

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.fulfillmentService,
        new Request(FULFILLMENT_URL, {
          body: JSON.stringify(body),
          method: 'POST',
          headers: {
            'X-Shopify-Hmac-Sha256': getHmac(JSON.stringify(body)),
            'X-Shopify-Shop-Domain': 'not-a-real-shop.myshopify.com',
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
      const {session, payload} =
        await shopify.authenticate.fulfillmentService(request);

      // THEN
      expect(session).toEqual(expectedSession);
      expect(payload.kind).toBe(body.kind);
    });

    describe('valid requests include an API client object', () => {
      expectAdminApiClient(async () => {
        const sessionStorage = new MemorySessionStorage();
        const shopify = shopifyApp(testConfig({sessionStorage}));

        const {request, session: expectedSession} =
          await getValidRequest(sessionStorage);

        const {admin, session: actualSession} =
          await shopify.authenticate.fulfillmentService(request);

        return {admin, expectedSession, actualSession};
      });
    });

    describe('token refresh for expired offline sessions', () => {
      it('does not refresh token when session is not expired', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();
        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
          }),
        );

        const oneHourFromNow = new Date(Date.now() + 1000 * 3600);
        const {request, session: expectedSession} = await getValidRequest(
          sessionStorage,
          {
            expires: oneHourFromNow,
            refreshToken: 'test-refresh-token',
          },
        );

        // WHEN
        const {session} =
          await shopify.authenticate.fulfillmentService(request);

        // THEN - Should return the same session without refreshing
        expect(session.accessToken).toBe(expectedSession.accessToken);
        expect(session.expires?.getTime()).toBe(oneHourFromNow.getTime());
      });

      it('refreshes token when session is expired and feature flag is enabled', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();
        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
          }),
        );

        const oneSecondAgo = new Date(Date.now() - 1000);
        const thirtyDaysFromNow = new Date(Date.now() + 1000 * 3600 * 24 * 30);

        const {request, session: expiredSession} = await getValidRequest(
          sessionStorage,
          {
            expires: oneSecondAgo,
            refreshToken: 'test-refresh-token',
            refreshTokenExpires: thirtyDaysFromNow,
          },
        );

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
                refresh_token: 'test-refresh-token',
              }),
            },
          ),
          response: new Response(JSON.stringify(refreshResponse), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          }),
        });

        // WHEN
        const {session} =
          await shopify.authenticate.fulfillmentService(request);

        // THEN - Should return refreshed session
        expect(session.accessToken).toBe('new-access-token');
        expect(session.refreshToken).toBe('new-refresh-token');
        expect(session.id).toBe(expiredSession.id);
        expect(session.shop).toBe(TEST_SHOP);
        expect(session.expires?.getTime()).toBeGreaterThan(Date.now());
      });

      it('refreshes token when session is within milliseconds of expiry', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();
        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
          }),
        );

        const halfSecondFromNow = new Date(Date.now() + 500);
        const thirtyDaysFromNow = new Date(Date.now() + 1000 * 3600 * 24 * 30);

        const {request} = await getValidRequest(sessionStorage, {
          expires: halfSecondFromNow,
          refreshToken: 'test-refresh-token',
          refreshTokenExpires: thirtyDaysFromNow,
        });

        // Mock the refresh token API response
        const refreshResponse = {
          access_token: 'new-access-token-2',
          scope: 'testScope',
          expires_in: 3600,
          refresh_token: 'new-refresh-token-2',
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
                refresh_token: 'test-refresh-token',
              }),
            },
          ),
          response: new Response(JSON.stringify(refreshResponse), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          }),
        });

        // WHEN
        const {session} =
          await shopify.authenticate.fulfillmentService(request);

        // THEN - Should return refreshed session
        expect(session.accessToken).toBe('new-access-token-2');
        expect(session.refreshToken).toBe('new-refresh-token-2');
      });

      it('does not refresh token when feature flag is disabled even if session is expired', async () => {
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

        const oneSecondAgo = new Date(Date.now() - 1000);
        const {request, session: expiredSession} = await getValidRequest(
          sessionStorage,
          {
            expires: oneSecondAgo,
            refreshToken: 'test-refresh-token',
          },
        );

        // WHEN
        const {session} =
          await shopify.authenticate.fulfillmentService(request);

        // THEN - Should return the expired session without refreshing
        expect(session.accessToken).toBe(expiredSession.accessToken);
        expect(session.expires?.getTime()).toBe(oneSecondAgo.getTime());
        expect(session.refreshToken).toBe('test-refresh-token');
      });

      it('does not refresh token when distribution is ShopifyAdmin', async () => {
        // GIVEN
        const sessionStorage = new MemorySessionStorage();
        const shopify = shopifyApp(
          testConfig({
            sessionStorage,
            distribution: AppDistribution.ShopifyAdmin,
          }),
        );

        const body = {kind: 'FULFILLMENT_REQUEST'};
        const bodyString = JSON.stringify(body);

        const request = new Request(FULFILLMENT_URL, {
          body: bodyString,
          method: 'POST',
          headers: {
            'X-Shopify-Hmac-Sha256': getHmac(bodyString),
            'X-Shopify-Shop-Domain': TEST_SHOP,
          },
        });

        // WHEN
        const {session} =
          await shopify.authenticate.fulfillmentService(request);

        // THEN - ShopifyAdmin uses custom app sessions with permanent tokens
        expect(session).toBeDefined();
        expect(session.shop).toBe(TEST_SHOP);
        // Custom app sessions don't have expiry or refresh tokens
      });
    });
  });
});

async function getValidRequest(
  sessionStorage: SessionStorage,
  sessionOverrides?: Partial<Session>,
) {
  const session = await setUpValidSession(sessionStorage, {
    isOnline: false,
    ...sessionOverrides,
  });

  const body = {kind: 'FULFILLMENT_REQUEST'};
  const bodyString = JSON.stringify(body);

  const request = new Request(FULFILLMENT_URL, {
    body: bodyString,
    method: 'POST',
    headers: {
      'X-Shopify-Hmac-Sha256': getHmac(bodyString),
      'X-Shopify-Shop-Domain': TEST_SHOP,
    },
  });

  return {body, request, session};
}
