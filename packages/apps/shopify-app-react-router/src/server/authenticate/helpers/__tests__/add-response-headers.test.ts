import {shopifyApp} from '../../..';
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
});
