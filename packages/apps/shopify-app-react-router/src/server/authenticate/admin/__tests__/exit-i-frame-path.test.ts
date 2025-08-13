import {ShopifyError} from '@shopify/shopify-api';

import {shopifyApp} from '../../..';
import {
  APP_URL,
  TEST_SHOP,
  expectDocumentRequestHeaders,
  getThrownResponse,
  testConfig,
} from '../../../__test-helpers';
import {APP_BRIDGE_URL} from '../../const';

describe('authorize.admin exit iframe path', () => {
  test('Uses App Bridge to exit iFrame when the url matches auth.exitIframePath', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    // WHEN
    const exitTo = encodeURIComponent(config.appUrl);
    const url = `${APP_URL}/auth/exit-iframe?exitIframe=${exitTo}&shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url),
    );

    // THEN
    const responseText = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'text/html;charset=utf-8',
    );
    expect(responseText).toContain(
      `<script data-api-key="${config.apiKey}" src="${APP_BRIDGE_URL}"></script>`,
    );
    expect(responseText).toContain(
      `<script>window.open("${decodeURIComponent(exitTo)}/", "_top")</script>`,
    );
    expectDocumentRequestHeaders(response);
  });

  test('Uses App Bridge to exit iFrame when the url matches auth.exitIframePath and authPathPrefix is passed', async () => {
    // GIVEN
    const authPathPrefix = '/shopify';
    const config = testConfig({authPathPrefix});
    const shopify = shopifyApp(config);

    // WHEN
    const exitTo = encodeURIComponent(config.appUrl);
    const url = `${APP_URL}${authPathPrefix}/exit-iframe?exitIframe=${exitTo}&shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url),
    );

    // THEN
    const responseText = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(
      'text/html;charset=utf-8',
    );
    expect(responseText).toContain(
      `<script data-api-key="${config.apiKey}" src="${APP_BRIDGE_URL}"></script>`,
    );
    expect(responseText).toContain(
      `<script>window.open("${decodeURIComponent(exitTo)}/", "_top")</script>`,
    );
    expectDocumentRequestHeaders(response);
  });

  test('Allows relative paths as exitIframe param', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const exitTo = encodeURIComponent('/my-path');
    const url = `${APP_URL}/auth/exit-iframe?exitIframe=${exitTo}&shop=${TEST_SHOP}`;
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(url),
    );

    // THEN
    expect(response.status).toBe(200);
    expectDocumentRequestHeaders(response);
  });

  test('refuses to redirect to invalid URLs', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const exitTo = encodeURIComponent('file:///not/allowed/path');
    const url = `${APP_URL}/auth/exit-iframe?exitIframe=${exitTo}&shop=${TEST_SHOP}`;

    // THEN
    await expect(shopify.authenticate.admin(new Request(url))).rejects.toThrow(
      ShopifyError,
    );
  });
});
