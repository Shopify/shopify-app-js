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
