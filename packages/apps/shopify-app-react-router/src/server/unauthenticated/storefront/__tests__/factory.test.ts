import {setUpValidSession as setUpValidSessionImport} from '@shopify/shopify-api/test-helpers';

import {AppDistribution, shopifyApp} from '../../../index';
import {
  TEST_SHOP,
  setUpValidSession,
  testConfig,
  expectStorefrontApiClient,
  setupValidCustomAppSession,
} from '../../../__test-helpers';

describe('unauthenticated storefront context', () => {
  it('throws an error if there is no offline session for the shop', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // EXPECT
    await expect(
      shopify.unauthenticated.storefront(TEST_SHOP),
    ).rejects.toThrow();
  });

  expectStorefrontApiClient(async () => {
    const shopify = shopifyApp(testConfig());
    const expectedSession = await setUpValidSession(shopify.sessionStorage, {
      isOnline: false,
    });
    const {storefront, session: actualSession} =
      await shopify.unauthenticated.storefront(TEST_SHOP);

    return {storefront, expectedSession, actualSession};
  });

  describe('token expiration and refresh', () => {
    describe('with feature flag disabled', () => {
      it('returns session without refreshing even when expired', async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({
            future: {
              unstable_expiringOfflineAccessTokenSupport: false,
            },
          }),
        );
        const expiredDate = new Date(Date.now() - 5000);
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });

        await shopify.sessionStorage!.storeSession(session);

        // WHEN
        const {session: actualSession} =
          await shopify.unauthenticated.storefront(TEST_SHOP);

        // THEN
        expect(actualSession.accessToken).toBe('old-access-token');
        expect(actualSession.expires).toEqual(expiredDate);
      });
    });

    describe('with feature flag enabled', () => {
      it('returns session without refreshing when not expired', async () => {
        // GIVEN
        // 24 hours in the future
        const futureDate = new Date(Date.now() + 86400000);
        const shopify = shopifyApp(
          testConfig({
            future: {
              unstable_expiringOfflineAccessTokenSupport: true,
            },
          }),
        );
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: futureDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'valid-access-token',
        });

        await shopify.sessionStorage!.storeSession(session);

        // WHEN
        const {session: actualSession} =
          await shopify.unauthenticated.storefront(TEST_SHOP);

        // THEN
        expect(actualSession.accessToken).toBe('valid-access-token');
        expect(actualSession.expires).toEqual(futureDate);
      });

      it('returns a new session if the session is expired', async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({
            future: {
              unstable_expiringOfflineAccessTokenSupport: true,
            },
          }),
        );
        const expiredDate = new Date(Date.now() - 5000);
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });

        await shopify.sessionStorage!.storeSession(session);
        // WHEN
        const {session: actualSession} =
          await shopify.unauthenticated.storefront(TEST_SHOP);

        // THEN
        expect(actualSession.accessToken).toBe('new-access-token');
        expect(actualSession.expires).toBeDefined();
      }, 10000);
    });

    it('returns consistent session across calls', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {
            unstable_expiringOfflineAccessTokenSupport: true,
          },
        }),
      );
      const validExpiry = new Date(Date.now() + 86400000);
      const session = setUpValidSessionImport({
        shop: TEST_SHOP,
        expires: validExpiry,
        refreshToken: 'refresh-token',
        isOnline: false,
        accessToken: 'access-token',
      });

      await shopify.sessionStorage!.storeSession(session);

      // WHEN
      const result1 = await shopify.unauthenticated.storefront(TEST_SHOP);
      const result2 = await shopify.unauthenticated.storefront(TEST_SHOP);

      // THEN
      expect(result1.session.accessToken).toBe('access-token');
      expect(result2.session.accessToken).toBe('access-token');
      expect(result1.session.id).toBe(result2.session.id);
      expect(result1.storefront).toBeDefined();
      expect(result2.storefront).toBeDefined();
    });
  });
});

describe('unauthenticated storefront context for merchant custom apps', () => {
  expectStorefrontApiClient(async () => {
    const shopify = shopifyApp(
      testConfig({
        distribution: AppDistribution.ShopifyAdmin,
        adminApiAccessToken: 'admin-access-token',
        privateAppStorefrontAccessToken: 'storefront-access',
      }),
    );
    const expectedSession = setupValidCustomAppSession(TEST_SHOP);
    const {storefront, session: actualSession} =
      await shopify.unauthenticated.storefront(TEST_SHOP);

    return {storefront, expectedSession, actualSession};
  });
});
