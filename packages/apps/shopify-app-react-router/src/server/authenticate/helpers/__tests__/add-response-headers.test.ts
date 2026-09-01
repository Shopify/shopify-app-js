import {shopifyApp} from '../../..';
import {APP_BRIDGE_URL, CDN_URL} from '../../const';
import {
  APP_URL,
  TEST_SHOP,
  expectDocumentRequestHeaders,
  testConfig,
} from '../../../__test-helpers';

describe('addDocumentResponseHeaders', () => {
  it('adds frame-ancestors CSP headers for embedded apps', () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);
    const response = new Response();

    // WHEN
    shopify.addDocumentResponseHeaders(request, response.headers);

    // THEN
    expectDocumentRequestHeaders(response, true);
  });

  it('uses a custom polarisUrl in the preload Link header when configured', () => {
    // GIVEN
    const polarisUrl = 'https://cdn.shopify.com/shopifycloud/polaris-1.1-rc.js';
    const shopify = shopifyApp(testConfig({polarisUrl}));
    const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);
    const response = new Response();

    // WHEN
    shopify.addDocumentResponseHeaders(request, response.headers);

    // THEN
    expect(response.headers.get('Link')).toEqual(
      `<${CDN_URL}>; rel="preconnect", <${APP_BRIDGE_URL}>; rel="preload"; as="script", <${polarisUrl}>; rel="preload"; as="script"`,
    );
  });
});
