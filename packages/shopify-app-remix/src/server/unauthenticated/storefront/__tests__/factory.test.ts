import {shopifyApp} from '../../../index';
import {
  TEST_SHOP,
  setUpValidSession,
  testConfig,
  expectStorefrontApiClient,
} from '../../../__test-helpers';

describe('unauthenticated storefront context', () => {
  expectStorefrontApiClient(async () => {
    const shopify = shopifyApp(testConfig());
    const expectedSession = await setUpValidSession(
      shopify.sessionStorage,
      false,
    );
    const {storefront, session: actualSession} =
      await shopify.unauthenticated.storefront(TEST_SHOP);

    return {storefront, expectedSession, actualSession};
  });
});
