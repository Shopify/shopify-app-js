import {shopifyApp} from '../../../shopify-app';
import {APP_URL, getThrownResponse, testConfig} from '../../../__test-helpers';

describe('Reject bot requests', () => {
  // This test is relevant for the following one - our bot check rejects agents from google as bots by default, so this
  // test helps prevent regressions in that behaviour.
  it('rejects user agents that contain the word google', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL, {headers: {'User-Agent': 'google'}}),
    );

    // THEN
    expect(response.status).toBe(410);
  });

  it.each([
    // Accepted parts
    'Google Shopify POS/something',
    'Google Shopify Mobile/something',
    // Full agents
    'Mozilla/5.0 (Linux; Android 14; sdk_gphone64_arm64 Build/UE1A.230829.036.A1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/113.0.5672.136 Mobile Safari/537.36 com.jadedpixel.pos Shopify POS/9.7.0/Android/14/google/sdk_gphone64_arm64/development cart MobileMiddlewareSupported #',
    'Mozilla/5.0 (Linux; Android 14; sdk_gphone64_arm64 Build/UE1A.230829.036.A1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/113.0.5672.136 Mobile Safari/537.36 Unframed Frameless Shopify Mobile/Android/9.157.0 (Build 1 with API 34 on Google sdk_gphone64_arm64 debug)',
  ])('allows Shopify request with User-Agent: %s', async (shopifyAgent) => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL, {headers: {'User-Agent': shopifyAgent}}),
    );

    // THEN
    expect(response.status).toBe(302);
  });
});
