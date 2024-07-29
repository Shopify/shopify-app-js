import {AppDistribution} from '../../../../../types';
import {
  APP_URL,
  TEST_SHOP,
  setupValidCustomAppSession,
  testConfig,
} from '../../../../../__test-helpers';
import {shopifyApp} from '../../../../..';

describe('authenticate', () => {
  it('creates a valid session from the configured access token', async () => {
    // GIVEN
    const config = testConfig({
      isEmbeddedApp: false,
      distribution: AppDistribution.ShopifyAdmin,
      adminApiAccessToken: 'test-token',
    });
    const shopify = shopifyApp(config);

    const expectedSession = setupValidCustomAppSession(TEST_SHOP);

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(`${APP_URL}?shop=${TEST_SHOP}`),
    );

    // THEN
    expect(session).toEqual(expectedSession);
  });
});
