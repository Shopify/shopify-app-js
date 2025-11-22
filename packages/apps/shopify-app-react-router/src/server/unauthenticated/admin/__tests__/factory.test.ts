import {setUpValidSession as setUpValidSessionImport} from '@shopify/shopify-api/test-helpers';

import {
  TEST_SHOP,
  expectAdminApiClient,
  setUpValidSession,
  setupValidCustomAppSession,
  testConfig,
} from '../../../__test-helpers';
import {
  AppDistribution,
  SessionNotFoundError,
  shopifyApp,
} from '../../../index';

describe('unauthenticated admin context', () => {
  it('throws an error if there is no offline session for the shop', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // EXPECT
    await expect(shopify.unauthenticated.admin(TEST_SHOP)).rejects.toThrow(
      SessionNotFoundError,
    );
  });

  expectAdminApiClient(async () => {
    const shopify = shopifyApp(testConfig());
    const expectedSession = await setUpValidSession(shopify.sessionStorage, {
      isOnline: false,
    });
    const {admin, session: actualSession} =
      await shopify.unauthenticated.admin(TEST_SHOP);

    return {admin, expectedSession, actualSession};
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
          await shopify.unauthenticated.admin(TEST_SHOP);

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
          await shopify.unauthenticated.admin(TEST_SHOP);

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
          await shopify.unauthenticated.admin(TEST_SHOP);

        // THEN
        expect(actualSession.accessToken).toBe('new-access-token');
        expect(actualSession.expires).toBeDefined();
      }, 10000);
    });
  });
});

describe('unauthenticated admin context for merchant custom apps', () => {
  expectAdminApiClient(async () => {
    const config = testConfig({
      distribution: AppDistribution.ShopifyAdmin,
      adminApiAccessToken: 'admin-access-token',
      sessionStorage: undefined,
    });

    const shopify = shopifyApp(config);
    const expectedSession = setupValidCustomAppSession(TEST_SHOP);
    const {admin, session: actualSession} =
      await shopify.unauthenticated.admin(TEST_SHOP);

    return {admin, expectedSession, actualSession};
  });
});
