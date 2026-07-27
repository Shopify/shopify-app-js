import {shopifyApp} from '../../..';
import {APP_BRIDGE_URL} from '../../const';
import {
  API_KEY,
  APP_URL,
  BASE64_HOST,
  SHOPIFY_HOST,
  TEST_SHOP,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../__test-helpers';

describe('authorize.admin doc request path', () => {
  describe('errors', () => {
    it.each([
      {shop: TEST_SHOP, host: undefined},
      {shop: TEST_SHOP, host: 'invalid-domain.test'},
      {shop: undefined, host: BASE64_HOST},
      {shop: 'invalid', host: BASE64_HOST},
    ])(
      'renders App Bridge when embedded app has missing or invalid params: %s',
      async ({shop, host}) => {
        // GIVEN
        const config = testConfig();
        const shopify = shopifyApp(config);
        const searchParams = new URLSearchParams();
        if (shop) searchParams.set('shop', shop);
        if (host) searchParams.set('host', host);

        // WHEN
        const response = await getThrownResponse(
          shopify.authenticate.admin,
          new Request(`${APP_URL}?${searchParams.toString()}`),
        );

        // THEN
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe(
          'text/html;charset=utf-8',
        );
        expect((await response.text()).trim()).toBe(
          `<script data-api-key="${config.apiKey}" src="${APP_BRIDGE_URL}"></script>`,
        );
      },
    );

    it('does not leak an attacker-controlled shop into response headers when shop is invalid', async () => {
      // Regression test: when `?shop=evil.com` fails sanitizeShop, the App
      // Bridge page must not echo that value into CSP frame-ancestors or the
      // Link preconnect header. See render-app-bridge.ts.
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);
      const evilShop = 'evil.com';
      const searchParams = new URLSearchParams();
      searchParams.set('shop', evilShop);
      searchParams.set('host', BASE64_HOST);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?${searchParams.toString()}`),
      );

      // THEN
      expect(response.status).toBe(200);
      const csp = response.headers.get('Content-Security-Policy');
      // For an embedded app with no valid shop, no shop-specific frame-ancestors
      // entry should be emitted, and certainly not the attacker-controlled value.
      if (csp !== null) {
        expect(csp).not.toContain(evilShop);
      }
      const link = response.headers.get('Link');
      // The Link preconnect header is only set when shop is valid; with an
      // invalid shop it should be absent.
      expect(link).toBeNull();
    });

    it('throws an error if the request URL is the login path', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const request = new Request(`${APP_URL}/auth/login`);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request,
      );

      // THEN
      expect(response.status).toBe(500);
    });

    it('throws an error if the request URL is the login path with basename', async () => {
      // GIVEN
      // Simulates an app with React Router basename="/base-path"
      // When navigating to the login route, the URL becomes /base-path/auth/login
      const shopify = shopifyApp(testConfig({authPathPrefix: '/auth'}));
      const request = new Request(`${APP_URL}/base-path/auth/login`);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request,
      );

      // THEN
      // SHOULD throw 500 error with helpful message
      expect(response.status).toBe(500);
      const errorMessage = await response.text();
      expect(errorMessage).toContain(
        'Detected call to shopify.authenticate.admin() from configured login path',
      );
      expect(errorMessage).toContain('/auth/login');
    });

    it('redirects to the bounce page URL if id_token search param is missing', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`,
        ),
      );

      // THEN
      const {pathname, searchParams} = new URL(
        response.headers.get('location')!,
        APP_URL,
      );

      expect(response.status).toBe(302);
      expect(pathname).toBe('/auth/session-token');
      expect(searchParams.get('shop')).toBe(TEST_SHOP);
      expect(searchParams.get('host')).toBe(BASE64_HOST);
      expect(searchParams.get('shopify-reload')).toBe(
        `${APP_URL}/?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`,
      );
    });

    it('always bounces to the app URL, regardless of request URL', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `https://some-other-host.not.real?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`,
        ),
      );

      // THEN
      const {searchParams} = new URL(
        response.headers.get('location')!,
        APP_URL,
      );

      expect(response.status).toBe(302);
      expect(searchParams.get('shopify-reload')).toBe(
        `${APP_URL}/?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`,
      );
    });

    it('throws a 302 to reload the page if app is embedded and the id_token search param is invalid for document requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=invalid`,
        ),
      );

      // THEN
      const {pathname, searchParams} = new URL(
        response.headers.get('location')!,
        APP_URL,
      );

      expect(response.status).toBe(302);
      expect(pathname).toBe('/auth/session-token');
      expect(searchParams.get('shop')).toBe(TEST_SHOP);
      expect(searchParams.get('host')).toBe(BASE64_HOST);
      expect(searchParams.get('shopify-reload')).toBe(
        `${APP_URL}/?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`,
      );
    });

    it('throws a 401 if app is embedded and the id_token search param is invalid for XHR requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
          headers: {Authorization: 'Bearer invalid'},
        }),
      );

      // THEN
      expect(response.status).toBe(401);
      expect(
        response.headers.get('X-Shopify-Retry-Invalid-Session-Request'),
      ).toBe('1');
    });
  });

  it("redirects to the embedded app URL if the app isn't embedded yet", async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);
    const host = new URL(`https://${SHOPIFY_HOST}`);
    await setUpValidSession(shopify.sessionStorage);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`),
    );

    // THEN
    const {hostname, pathname} = new URL(response.headers.get('location')!);

    expect(response.status).toBe(302);
    expect(hostname).toBe(host.hostname);
    expect(pathname).toBe(`${host.pathname}/apps/${API_KEY}`);
  });
});
