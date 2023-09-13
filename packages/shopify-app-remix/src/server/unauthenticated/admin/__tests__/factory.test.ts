import {shopifyApp} from '../../../index';
import {
  TEST_SHOP,
  setUpValidSession,
  testConfig,
  expectAdminApiClient,
} from '../../../__test-helpers';

describe('unauthenticated admin context', () => {
  expectAdminApiClient(async () => {
    const shopify = shopifyApp(testConfig());
    const expectedSession = await setUpValidSession(
      shopify.sessionStorage,
      false,
    );
    const {admin, session: actualSession} = await shopify.unauthenticated.admin(
      TEST_SHOP,
    );

    return {admin, expectedSession, actualSession};
  });
});
