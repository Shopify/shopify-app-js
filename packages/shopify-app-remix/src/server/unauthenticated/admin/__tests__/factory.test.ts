import {SessionNotFoundError, shopifyApp} from '../../../index';
import {
  TEST_SHOP,
  setUpValidSession,
  testConfig,
  expectAdminApiClient,
} from '../../../__test-helpers';

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
