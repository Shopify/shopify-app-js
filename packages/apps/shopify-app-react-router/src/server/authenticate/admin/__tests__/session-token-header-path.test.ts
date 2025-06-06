import {SESSION_COOKIE_NAME, Session} from '@shopify/shopify-api';

import {shopifyApp} from '../../..';
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from '../../../__test-helpers';

describe('authorize.session token header path', () => {
  describe('errors', () => {
    it('throws a 401 if the session token is invalid', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const response = await getThrownResponse(
        shopify.authenticate.admin,
        new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
          headers: {Authorization: 'Bearer im-a-valid-token-promise'},
        }),
      );

      // THEN
      expect(response.status).toBe(401);
    });
  });

  describe.each([true, false])(
    'success cases when isOnline: %s',
    (isOnline) => {
      it('returns context when session exists for embedded apps', async () => {
        // GIVEN
        const shopify = shopifyApp({
          ...testConfig({useOnlineTokens: isOnline}),
          future: {removeRest: false},
        });

        const testSession = await setUpValidSession(shopify.sessionStorage, {
          isOnline,
        });

        // WHEN
        const {token, payload} = getJwt();
        const {sessionToken, admin, session} = await shopify.authenticate.admin(
          new Request(`${APP_URL}?shop=${TEST_SHOP}&host=${BASE64_HOST}`, {
            headers: {Authorization: `Bearer ${token}`},
          }),
        );

        // THEN
        expect(sessionToken).toEqual(payload);
        expect(session).toBe(testSession);
        expect(admin.rest.session).toBe(testSession);
      });

      it('returns context when session exists for non-embedded apps', async () => {
        // GIVEN
        const shopify = shopifyApp({
          ...testConfig({isEmbeddedApp: false, useOnlineTokens: isOnline}),
          future: {removeRest: false},
        });

        let testSession: Session;
        testSession = await setUpValidSession(shopify.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(shopify.sessionStorage, {
            isOnline: true,
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
});
