import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {AppDistribution, shopifyApp} from '../../..';
import {
  expectAdminApiClient,
  getHmac,
  getThrownResponse,
  setUpValidSession,
  testConfig,
  TEST_SHOP,
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

        if (!admin) {
          throw new Error('No admin client');
        }

        return {admin, expectedSession, actualSession};
      });
    });
  });
});

async function getValidRequest(sessionStorage: SessionStorage) {
  const session = await setUpValidSession(sessionStorage, {isOnline: false});

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
