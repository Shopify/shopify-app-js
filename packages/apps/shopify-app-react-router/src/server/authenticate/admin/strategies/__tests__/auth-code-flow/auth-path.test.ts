import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  TEST_SHOP,
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  getThrownResponse,
  testConfig,
} from '../../../../../__test-helpers';

describe('authorize.admin auth path', () => {
  test('throws an 400 Response if the shop param is missing', async () => {
    // GIVEN
    const config = testConfig({
      future: {unstable_newEmbeddedAuthStrategy: false},
    });
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url),
    );

    // THEN
    expect(response.status).toBe(400);
  });

  test('throws an 400 Response if the shop param is invalid', async () => {
    // GIVEN
    const config = testConfig({
      future: {unstable_newEmbeddedAuthStrategy: false},
    });
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth?shop=invalid_shop`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url),
    );

    // THEN
    expect(response.status).toBe(400);
  });

  test('throws an 302 Response to begin auth', async () => {
    // GIVEN
    const config = testConfig({
      future: {unstable_newEmbeddedAuthStrategy: false},
    });
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url),
    );

    // THEN
    expectBeginAuthRedirect(config, response);
  });

  test('redirects to exit-iframe when loading the auth path while in an iframe request', async () => {
    // GIVEN
    const config = testConfig({
      future: {unstable_newEmbeddedAuthStrategy: false},
    });
    const shopify = shopifyApp(config);

    // WHEN
    const url = `${APP_URL}/auth?shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url, {headers: {'Sec-Fetch-Dest': 'iframe'}}),
    );

    // THEN
    expectExitIframeRedirect(response, {host: null});
  });
});
