import {shopifyApp} from '../../../index';
import {
  TEST_SHOP,
  setUpValidSession,
  testConfig,
  expectStorefrontApiClient,
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
});
