import {LogSeverity} from '@shopify/shopify-api';

import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  BASE64_HOST,
  GRAPHQL_URL,
  TEST_SHOP,
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  mockExternalRequest,
  testConfig,
} from '../../../../../__test-helpers';

describe('authorize.admin doc request path', () => {
  describe('errors', () => {
    it('redirects to exit-iframe when embedded and there is no offline session', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {unstable_newEmbeddedAuthStrategy: false},
          isEmbeddedApp: true,
        }),
      );

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}`,
        ),
      );

      // THEN
      expectExitIframeRedirect(response);
    });

    it('redirects to auth when not embedded on an embedded app, and the API token is invalid', async () => {
      // GIVEN
      const config = testConfig({
        future: {unstable_newEmbeddedAuthStrategy: false},
        isEmbeddedApp: true,
      });
      const shopify = shopifyApp(config);
      await setUpValidSession(shopify.sessionStorage);

      await mockExternalRequest({
        request: new Request(GRAPHQL_URL, {method: 'POST'}),
        response: new Response(undefined, {status: 401}),
      });

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`),
      );

      // THEN
      expectBeginAuthRedirect(config, response);
    });

    it('returns non-401 codes when not embedded on an embedded app and the request fails', async () => {
      // GIVEN
      const config = testConfig({
        future: {unstable_newEmbeddedAuthStrategy: false},
        isEmbeddedApp: true,
      });
      const shopify = shopifyApp(config);
      await setUpValidSession(shopify.sessionStorage);

      await mockExternalRequest({
        request: new Request(GRAPHQL_URL, {method: 'POST'}),
        response: new Response('', {
          status: 500,
          statusText: 'Internal Server Error',
        }),
      });

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`),
      );

      // THEN
      expect(response.status).toBe(500);
      expect(config.logger?.log).toHaveBeenCalledWith(
        LogSeverity.Error,
        expect.stringContaining('Internal Server Error'),
      );
    });

    it('returns a 500 when not embedded on an embedded app and the request fails', async () => {
      // GIVEN
      const config = testConfig({
        future: {unstable_newEmbeddedAuthStrategy: false},
        isEmbeddedApp: true,
      });
      const shopify = shopifyApp(config);
      await setUpValidSession(shopify.sessionStorage);

      await mockExternalRequest({
        request: new Request(GRAPHQL_URL, {method: 'POST'}),
        response: new Response(
          JSON.stringify({errors: [{message: 'Something went wrong!'}]}),
        ),
      });

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`),
      );

      // THEN
      expect(response.status).toBe(500);
      expect(config.logger!.log).toHaveBeenCalledWith(
        LogSeverity.Error,
        expect.stringContaining('Something went wrong!'),
      );
    });

    it('redirects to exit-iframe if app is embedded and there is no session for the id_token when embedded', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          future: {unstable_newEmbeddedAuthStrategy: false},
          isEmbeddedApp: true,
        }),
      );
      await setUpValidSession(shopify.sessionStorage);
      const otherShopDomain = 'other-shop.myshopify.io';

      // WHEN
      const {token} = getJwt({dest: `https://${otherShopDomain}`});
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
        ),
      );

      // THEN
      expectExitIframeRedirect(response, {shop: otherShopDomain});
    });
  });
});
