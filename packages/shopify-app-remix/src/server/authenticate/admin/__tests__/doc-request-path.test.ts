import {LogSeverity, SESSION_COOKIE_NAME, Session} from '@shopify/shopify-api';

import {shopifyApp} from '../../..';
import {
  API_KEY,
  APP_URL,
  BASE64_HOST,
  GRAPHQL_URL,
  SHOPIFY_HOST,
  TEST_SHOP,
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  testConfig,
  signRequestCookie,
  expectLoginRedirect,
  mockExternalRequest,
} from '../../../__test-helpers';

describe('authorize.admin doc request path', () => {
  describe('errors', () => {
    it.each([
      {shop: TEST_SHOP, host: undefined},
      {shop: TEST_SHOP, host: 'invalid-domain.test'},
      {shop: undefined, host: BASE64_HOST},
      {shop: 'invalid', host: BASE64_HOST},
    ])('throws when %s', async ({shop, host}) => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const searchParams = new URLSearchParams();
      if (shop) searchParams.set('shop', shop);
      if (host) searchParams.set('host', host);

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?${searchParams.toString()}`),
      );

      // THEN
      expectLoginRedirect(response);
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

    it('throws a 401 if app is embedded and the id_token search param is invalid', async () => {
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
      expect(response.status).toBe(401);
    });
  });

  it('returns a 400 response when no shop is available', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({isEmbeddedApp: false}));
    await setUpValidSession(shopify.sessionStorage);

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(APP_URL),
    );

    // THEN
    expect(response.status).toBe(400);
  });
});
