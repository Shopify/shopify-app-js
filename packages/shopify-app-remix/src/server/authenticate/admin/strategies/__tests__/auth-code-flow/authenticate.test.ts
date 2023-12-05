import {SESSION_COOKIE_NAME, Session} from '@shopify/shopify-api';

import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  testConfig,
  signRequestCookie,
} from '../../../../../__test-helpers';

describe('authenticate', () => {
  describe('errors', () => {
    it('redirects to exit-iframe if app is embedded and the session is no longer valid for the id_token when embedded', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          scopes: ['otherTestScope'],
          future: {unstable_newEmbeddedAuthStrategy: false},
          isEmbeddedApp: true,
        }),
      );
      await setUpValidSession(shopify.sessionStorage);

      // WHEN
      const {token} = getJwt();
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(
          `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
        ),
      );

      // THEN
      expectExitIframeRedirect(response);
    });

    // manageAccessToken or ensureInstalledOnShop
    it('redirects to auth if there is no session cookie for non-embedded apps when at the top level', async () => {
      // GIVEN
      const config = testConfig({
        isEmbeddedApp: false,
      });
      const shopify = shopifyApp(config);
      await setUpValidSession(shopify.sessionStorage);

      // WHEN
      const request = new Request(
        `${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`,
      );

      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request,
      );

      // THEN
      expectBeginAuthRedirect(config, response);
    });

    it('redirects to auth if the session is no longer valid for non-embedded apps when at the top level', async () => {
      // GIVEN
      const config = testConfig({
        scopes: ['otherTestScope'],
        isEmbeddedApp: false,
      });
      const shopify = shopifyApp(config);
      const session = await setUpValidSession(shopify.sessionStorage);

      // WHEN
      const request = new Request(
        `${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`,
      );
      signRequestCookie({
        request,
        cookieName: SESSION_COOKIE_NAME,
        cookieValue: session.id,
      });

      const response = await getThrownResponse(
        shopify.authenticate.admin,
        request,
      );

      // THEN
      expectBeginAuthRedirect(config, response);
    });
  });

  describe.each([true, false])(
    'success cases when isOnline: %s',
    (isOnline) => {
      it('returns the context if the session is valid and the app is embedded', async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({
            useOnlineTokens: isOnline,
            future: {unstable_newEmbeddedAuthStrategy: false},
            isEmbeddedApp: true,
          }),
        );

        let testSession: Session;
        testSession = await setUpValidSession(shopify.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(shopify.sessionStorage, {
            isOnline,
          });
        }

        // WHEN
        const {token} = getJwt();
        const {admin, session} = await shopify.authenticate.admin(
          new Request(
            `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
          ),
        );

        // THEN
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
      });

      it('returns the context if the session is valid and the app is not embedded', async () => {
        // GIVEN
        const shopify = shopifyApp(
          testConfig({
            isEmbeddedApp: false,
          }),
        );

        let testSession: Session;
        testSession = await setUpValidSession(shopify.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(shopify.sessionStorage, {
            isOnline,
          });
        }

        // WHEN
        const request = new Request(
          `${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`,
        );
        signRequestCookie({
          request,
          cookieName: SESSION_COOKIE_NAME,
          cookieValue: testSession.id,
        });

        const {admin, session} = await shopify.authenticate.admin(request);

        // THEN
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
      });
    },
  );

  // manageAccessToken & ensureInstalledOnShop
  it('loads a session from the cookie from a request with no search params when not embedded', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({isEmbeddedApp: false}));
    const testSession = await setUpValidSession(shopify.sessionStorage);

    // WHEN
    const request = new Request(APP_URL);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: testSession.id,
    });

    const {session} = await shopify.authenticate.admin(request);

    // THEN
    expect(session).toBe(testSession);
  });
});
