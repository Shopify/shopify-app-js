import {SESSION_COOKIE_NAME, Session} from '@shopify/shopify-api';

import {shopifyApp} from '../../../../..';
import {
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  mockExternalRequest,
  setUpValidSession,
  testConfig,
} from '../../../../../__test-helpers';

const USER_ID = 902541635;

describe('authenticate', () => {
  it('performs token exchange when there is no offline session', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp(config);

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    const [persistedSession] = await config.sessionStorage.findSessionsByShop(
      TEST_SHOP,
    );

    expect(persistedSession).toEqual(session);
    expect(session).toMatchObject({
      accessToken: '123abc-exchanged-from-session-token',
      id: `offline_${TEST_SHOP}`,
      isOnline: false,
      scope: 'read_orders',
      shop: TEST_SHOP,
      state: '',
    });
  });

  it('performs token exchange when existing session is no longer valid', async () => {
    // GIVEN
    const config = testConfig({useOnlineTokens: true});
    const shopify = shopifyApp(config);
    const anHourAgo = new Date(Date.now() - 1000 * 3600);
    await setUpValidSession(shopify.sessionStorage, true, anHourAgo);

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');
    await mockTokenExchangeRequest(token, 'online');

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    const [_, onlineSession] = await config.sessionStorage.findSessionsByShop(
      TEST_SHOP,
    );

    expect(onlineSession).toEqual(session);
    expect(session).toMatchObject({
      accessToken: '123abc-exchanged-from-session-token',
      id: `${TEST_SHOP}_${USER_ID}`,
      isOnline: true,
      scope: 'read_orders',
      shop: TEST_SHOP,
      state: '',
      onlineAccessInfo: expect.any(Object),
    });
  });

  describe.each([true, false])(
    'existing sessions when isOnline: %s',
    (isOnline) => {
      it('returns the context if the session is valid', async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig({useOnlineTokens: isOnline}));

        let testSession: Session;
        testSession = await setUpValidSession(shopify.sessionStorage);
        if (isOnline) {
          testSession = await setUpValidSession(
            shopify.sessionStorage,
            isOnline,
          );
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
        expect(session.isOnline).toEqual(isOnline);
      });
    },
  );

  test('throws a 500 if afterAuth hook throws an error', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp({
      ...config,
      hooks: {
        afterAuth: () => {
          throw new Error('test');
        },
      },
    });

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const response = await getThrownResponse(
      shopify.authenticate.admin,
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    expect(response.status).toBe(500);
  });

  test('Runs the afterAuth hooks passing', async () => {
    // GIVEN
    const afterAuthMock = jest.fn();
    const config = testConfig({
      hooks: {
        afterAuth: afterAuthMock,
      },
    });
    const shopify = shopifyApp(config);

    const {token} = getJwt();
    await mockTokenExchangeRequest(token, 'offline');

    // WHEN
    const {session} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    expect(session).toBeDefined();
    expect(afterAuthMock).toHaveBeenCalledTimes(1);
  });
});

async function mockTokenExchangeRequest(
  sessionToken,
  tokenType: 'online' | 'offline' = 'offline',
) {
  const responseBody = {
    access_token: '123abc-exchanged-from-session-token',
    scope: 'read_orders',
  };

  await mockExternalRequest({
    request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: API_KEY,
        client_secret: API_SECRET_KEY,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: sessionToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
        requested_token_type:
          tokenType === 'offline'
            ? 'urn:shopify:params:oauth:token-type:offline-access-token'
            : 'urn:shopify:params:oauth:token-type:online-access-token',
      }),
    }),
    response:
      tokenType === 'offline'
        ? new Response(JSON.stringify(responseBody))
        : new Response(
            JSON.stringify({
              ...responseBody,
              expires_in: Math.trunc(Date.now() / 1000) + 3600,
              associated_user_scope: 'read_orders',
              associated_user: {
                id: USER_ID,
                first_name: 'John',
                last_name: 'Smith',
                email: 'john@example.com',
                email_verified: true,
                account_owner: true,
                locale: 'en',
                collaborator: false,
              },
            }),
          ),
  });
}
