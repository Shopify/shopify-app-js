import {shopifyApp} from '../../..';
import {
  APP_URL,
  TEST_SHOP,
  expectDocumentRequestHeaders,
  testConfig,
} from '../../../__tests__/test-helper';

describe('addDocumentResponseHeaders', () => {
  it.each([true, false])(
    'adds frame-ancestors CSP headers when embedded = %s',
    (isEmbeddedApp) => {
      // GIVEN
      const config = {...testConfig(), isEmbeddedApp};
      const shopify = shopifyApp(config);
      const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);
      const response = new Response();

      // WHEN
      shopify.addDocumentResponseHeaders(request, response.headers);

      // THEN
      expectDocumentRequestHeaders(response, isEmbeddedApp);
    },
  );
});
