import {Session} from '@shopify/shopify-api';

import {shopifyApp} from '../../../../..';
import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../../../__test-helpers';

describe('authenticate', () => {
  describe('errors', () => {
    it('redirects to exit-iframe if app is embedded and the session is no longer valid for the id_token when embedded', async () => {
      // GIVEN
      const shopify = shopifyApp(
        testConfig({
          scopes: ['otherTestScope'],
          future: {unstable_newEmbeddedAuthStrategy: false},
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
      });
    },
  );
});
