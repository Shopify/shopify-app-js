import {LATEST_API_VERSION} from '@shopify/shopify-api';

import {shopifyApp} from '../../../index';
import {
  TEST_SHOP,
  setUpValidSession,
  testConfig,
  expectAdminApiClient,
} from '../../../__test-helpers';

const REQUEST_URL = `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/customers.json`;

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
