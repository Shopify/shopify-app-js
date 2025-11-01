import {HashFormat, createSHA256HMAC} from '@shopify/shopify-api/runtime';
import {setUpValidSession as setUpValidSessionImport} from '@shopify/shopify-api/test-helpers';

import {shopifyApp} from '../../../..';
import {
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  expectStorefrontApiClient,
  getThrownResponse,
  setUpValidSession,
  testConfig,
  mockExternalRequest,
} from '../../../../__test-helpers';
import {AppDistribution} from '../../../../types';

describe('authenticating app proxy requests', () => {
  it('Throws a 400 response if there is no signature param', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const url = new URL(APP_URL);
    url.searchParams.set('shop', TEST_SHOP);
    url.searchParams.set('timestamp', secondsInPast(10));

    const response = await getThrownResponse(
      shopify.authenticate.public.appProxy,
      new Request(url.toString()),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  it('Throws a 400 response if the signature param is incorrect', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const url = new URL(APP_URL);
    url.searchParams.set('shop', TEST_SHOP);
    url.searchParams.set('timestamp', secondsInPast(1));
    url.searchParams.set('signature', 'not-the-right-signature');

    const response = await getThrownResponse(
      shopify.authenticate.public.appProxy,
      new Request(url.toString()),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  it('Throws a 400 response if the timestamp is more than 90 seconds old', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const url = new URL(APP_URL);
    url.searchParams.set('shop', TEST_SHOP);
    url.searchParams.set('timestamp', secondsInPast(100));
    url.searchParams.set('signature', await createAppProxyHmac(url));

    const response = await getThrownResponse(
      shopify.authenticate.public.appProxy,
      new Request(url.toString()),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  it('Throws a 400 response if the timestamp is more than 90 seconds in the future', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const url = new URL(APP_URL);
    url.searchParams.set('shop', TEST_SHOP);
    url.searchParams.set('timestamp', secondsInFuture(100));
    url.searchParams.set('signature', await createAppProxyHmac(url));

    const response = await getThrownResponse(
      shopify.authenticate.public.appProxy,
      new Request(url.toString()),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  describe('Valid requests return a liquid helper', () => {
    it('Returns a Response with Content-Type: application/liquid and status 200 by default', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const {liquid} = await shopify.authenticate.public.appProxy(
        await getValidRequest(),
      );
      const response = liquid('Liquid template {{shop.name}}');

      // THEN
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Liquid template {{shop.name}}');
      expect(response.headers.get('Content-Type')).toBe('application/liquid');
    });

    it('Returns a Response with status equal to init if init is number', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const {liquid} = await shopify.authenticate.public.appProxy(
        await getValidRequest(),
      );
      const response = liquid('Liquid template {{shop.name}}', 400);

      // THEN
      expect(response.status).toBe(400);
    });

    it('Returns a Response with properties from init in init is an object', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const {liquid} = await shopify.authenticate.public.appProxy(
        await getValidRequest(),
      );
      const response = liquid('Liquid template {{shop.name}}', {
        headers: {
          my: 'header',
        },
        status: 300,
        statusText: 'Oops',
      });

      // THEN
      expect(response.headers.get('my')).toBe('header');
      expect(response.headers.get('Content-Type')).toBe('application/liquid');
      expect(response.status).toBe(300);
      expect(response.statusText).toBe('Oops');
    });

    it('Returns a Response body with layout {% layout none %} if layout is false', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const {liquid} = await shopify.authenticate.public.appProxy(
        await getValidRequest(),
      );
      const response = liquid('Liquid template {{shop.name}}', {
        layout: false,
      });

      // THEN
      expect(await response.text()).toBe(
        '{% layout none %} Liquid template {{shop.name}}',
      );
    });

    it('Returns a Response body combining layout and initOptions', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());

      // WHEN
      const {liquid} = await shopify.authenticate.public.appProxy(
        await getValidRequest(),
      );
      const response = liquid('Liquid template {{shop.name}}', {
        status: 400,
        layout: false,
      });

      // THEN
      expect(response.status).toBe(400);
      expect(await response.text()).toBe(
        '{% layout none %} Liquid template {{shop.name}}',
      );
    });

    describe('form action parsing', () => {
      it('adds trailing slashes to relative URLs', async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig());

        // WHEN
        const {liquid} = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );
        const response = liquid('<form action="/foo"></form>');

        // THEN
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('<form action="/foo/"></form>');
      });

      it('preserves search params when adding trailing slashes', async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig());

        // WHEN
        const {liquid} = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );
        const response = liquid('<form action="/foo?bar=baz"></form>');

        // THEN
        expect(response.status).toBe(200);
        expect(await response.text()).toBe(
          '<form action="/foo/?bar=baz"></form>',
        );
      });

      it('does not alter absolute URLs', async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig());

        // WHEN
        const {liquid} = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );
        const response = liquid('<form action="/foo?bar=baz"></form>');

        // THEN
        expect(response.status).toBe(200);
        expect(await response.text()).toBe(
          '<form action="/foo/?bar=baz"></form>',
        );
      });
    });

    describe('link href parsing', () => {
      it('adds trailing slashes to relative URLs', async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig());

        // WHEN
        const {liquid} = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );
        const response = liquid('<a href="/foo"></a>');

        // THEN
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('<a href="/foo/"></a>');
      });

      it('preserves search params when adding trailing slashes', async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig());

        // WHEN
        const {liquid} = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );
        const response = liquid('<a href="/foo?bar=baz"></a>');

        // THEN
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('<a href="/foo/?bar=baz"></a>');
      });

      it('does not alter absolute URLs', async () => {
        // GIVEN
        const shopify = shopifyApp(testConfig());

        // WHEN
        const {liquid} = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );
        const response = liquid('<a href="/foo?bar=baz"></a>');

        // THEN
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('<a href="/foo/?bar=baz"></a>');
      });
    });
  });

  describe('Valid requests with no session', () => {
    it('Returns AppProxy Context ', async () => {
      // GIVEN
      const config = testConfig();
      const shopify = shopifyApp(config);

      // WHEN
      const context = await shopify.authenticate.public.appProxy(
        await getValidRequest(),
      );

      // THEN
      expect(context).toStrictEqual({
        session: undefined,
        admin: undefined,
        storefront: undefined,
        liquid: expect.any(Function),
      });
    });
  });

  describe('Valid requests with a session return an admin API client', () => {
    expectAdminApiClient(async () => {
      const shopify = shopifyApp(testConfig());
      const expectedSession = await setUpValidSession(shopify.sessionStorage, {
        isOnline: false,
      });

      const {admin, session: actualSession} =
        await shopify.authenticate.public.appProxy(await getValidRequest());

      if (!admin) {
        throw new Error('No admin client');
      }

      return {admin, expectedSession, actualSession};
    });
  });

  describe('Valid requests with a session return a Storefront API client', () => {
    expectStorefrontApiClient(async () => {
      const shopify = shopifyApp(testConfig());
      const expectedSession = await setUpValidSession(shopify.sessionStorage, {
        isOnline: false,
      });

      const {storefront, session: actualSession} =
        await shopify.authenticate.public.appProxy(await getValidRequest());

      if (!storefront) {
        throw new Error('No storefront client');
      }

      return {storefront, expectedSession, actualSession};
    });
  });

  describe('Valid requests with expired offline session', () => {
    describe('when feature flag is disabled', () => {
      it('returns context with expired session without refreshing', async () => {
        // GIVEN
        const config = testConfig({
          future: {
            unstable_expiringOfflineAccessTokenSupport: false,
          },
        });
        const shopify = shopifyApp(config);

        const expiredDate = new Date(Date.now() - 5000);
        const expiredSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'expired-access-token',
        });

        await shopify.sessionStorage.storeSession(expiredSession);

        // WHEN
        const context = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );

        // THEN
        expect(context.session).toBeDefined();
        expect(context.session?.accessToken).toBe('expired-access-token');
        expect(context.session?.refreshToken).toBe('test-refresh-token');
        expect(context.admin).toBeDefined();
        expect(context.storefront).toBeDefined();
      });
    });

    describe('when feature flag is enabled', () => {
      it('refreshes token and returns context with new session', async () => {
        // GIVEN
        const config = testConfig({
          future: {
            unstable_expiringOfflineAccessTokenSupport: true,
          },
          distribution: AppDistribution.AppStore,
        });
        const shopify = shopifyApp(config);

        const expiredDate = new Date(Date.now() - 5000);
        const expiredSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'old-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });

        await shopify.sessionStorage!.storeSession(expiredSession);

        // Mock the refresh token API response
        const refreshResponse = {
          access_token: 'new-access-token',
          scope: 'testScope',
          expires_in: 3600,
          refresh_token: 'new-refresh-token',
          refresh_token_expires_in: 2592000,
        };

        await mockExternalRequest({
          request: new Request(
            `https://${TEST_SHOP}/admin/oauth/access_token`,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                client_id: API_KEY,
                client_secret: API_SECRET_KEY,
                refresh_token: 'old-refresh-token',
              }),
            },
          ),
          response: new Response(JSON.stringify(refreshResponse), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          }),
        });

        // WHEN
        const context = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );

        // THEN
        expect(context.session).toBeDefined();
        expect(context.session?.accessToken).toBe('new-access-token');
        expect(context.session?.refreshToken).toBe('new-refresh-token');
        expect(context.admin).toBeDefined();
        expect(context.storefront).toBeDefined();

        // Verify new session was stored
        const storedSession = await shopify.sessionStorage!.loadSession(
          `offline_${TEST_SHOP}`,
        );
        expect(storedSession?.accessToken).toBe('new-access-token');
        expect(storedSession?.refreshToken).toBe('new-refresh-token');
      });

      it('refreshes token when session expires within threshold', async () => {
        // GIVEN
        const config = testConfig({
          future: {
            unstable_expiringOfflineAccessTokenSupport: true,
          },
          distribution: AppDistribution.AppStore,
        });
        const shopify = shopifyApp(config);

        // 900ms from now (within 1000ms threshold)
        const almostExpiredDate = new Date(Date.now() + 900);
        const almostExpiredSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: almostExpiredDate,
          refreshToken: 'old-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });

        await shopify.sessionStorage!.storeSession(almostExpiredSession);

        // Mock the refresh token API response
        const refreshResponse = {
          access_token: 'new-access-token',
          scope: 'testScope',
          expires_in: 3600,
          refresh_token: 'new-refresh-token',
          refresh_token_expires_in: 2592000,
        };

        await mockExternalRequest({
          request: new Request(
            `https://${TEST_SHOP}/admin/oauth/access_token`,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                client_id: API_KEY,
                client_secret: API_SECRET_KEY,
                refresh_token: 'old-refresh-token',
              }),
            },
          ),
          response: new Response(JSON.stringify(refreshResponse), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          }),
        });

        // WHEN
        const context = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );

        // THEN
        expect(context.session?.accessToken).toBe('new-access-token');
        expect(context.session?.refreshToken).toBe('new-refresh-token');
      });

      it('does not refresh token when session is not expired', async () => {
        // GIVEN
        const config = testConfig({
          future: {
            unstable_expiringOfflineAccessTokenSupport: true,
          },
          distribution: AppDistribution.AppStore,
        });
        const shopify = shopifyApp(config);

        // 24 hours in future
        const futureDate = new Date(Date.now() + 86400000);
        const validSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: futureDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'valid-access-token',
        });

        await shopify.sessionStorage!.storeSession(validSession);

        // WHEN
        const context = await shopify.authenticate.public.appProxy(
          await getValidRequest(),
        );

        // THEN - Should not refresh when session is valid
        expect(context.session?.accessToken).toBe('valid-access-token');
        expect(context.session?.refreshToken).toBe('test-refresh-token');
        expect(context.admin).toBeDefined();
        expect(context.storefront).toBeDefined();
      });
    });
  });
});

async function getValidRequest(): Promise<Request> {
  const url = new URL(APP_URL);
  url.searchParams.set('shop', TEST_SHOP);
  url.searchParams.set('timestamp', secondsInPast(1));
  url.searchParams.set('signature', await createAppProxyHmac(url));

  return new Request(url.toString());
}

async function createAppProxyHmac(url: URL): Promise<string> {
  const params = Object.fromEntries(url.searchParams.entries());
  const string = Object.entries(params)
    .sort(([val1], [val2]) => val1.localeCompare(val2))
    .reduce((acc, [key, value]) => {
      return `${acc}${key}=${Array.isArray(value) ? value.join(',') : value}`;
    }, '');

  return createSHA256HMAC(API_SECRET_KEY, string, HashFormat.Hex);
}

function secondsInPast(seconds: number): string {
  const now = Math.trunc(Date.now() / 1000);

  return String(now - seconds);
}

function secondsInFuture(seconds: number): string {
  const now = Math.trunc(Date.now() / 1000);

  return String(now + seconds);
}
