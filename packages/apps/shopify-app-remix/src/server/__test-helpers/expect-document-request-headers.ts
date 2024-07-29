import {APP_BRIDGE_URL} from '../authenticate/const';

import {TEST_SHOP} from './const';

export function expectDocumentRequestHeaders(
  response: Response,
  isEmbeddedApp = true,
) {
  const headers = response.headers;

  if (isEmbeddedApp) {
    expect(headers.get('Content-Security-Policy')).toEqual(
      `frame-ancestors https://${encodeURIComponent(
        TEST_SHOP,
      )} https://admin.shopify.com https://*.spin.dev;`,
    );
    expect(headers.get('Link')).toEqual(
      `<${APP_BRIDGE_URL}>; rel="preload"; as="script";`,
    );
  } else {
    expect(headers.get('Content-Security-Policy')).toEqual(
      `frame-ancestors 'none';`,
    );
  }
}
