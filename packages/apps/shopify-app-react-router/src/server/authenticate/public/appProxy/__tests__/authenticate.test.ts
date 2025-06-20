import {HashFormat, createSHA256HMAC} from '@shopify/shopify-api/runtime';

import {shopifyApp} from '../../../..';
import {
  API_SECRET_KEY,
  APP_URL,
  TEST_SHOP,
  expectAdminApiClient,
  expectStorefrontApiClient,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../../__test-helpers';

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
