import {HashFormat, createSHA256HMAC} from '@shopify/shopify-api/runtime';

import {LATEST_API_VERSION, shopifyApp} from '../../../..';
import {
  API_SECRET_KEY,
  APP_URL,
  TEST_SHOP,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../../__tests__/test-helper';
import {mockExternalRequest} from '../../../../__tests__/request-mock';

const REQUEST_URL = `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/customers.json`;

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
    url.searchParams.set('timestamp', secondsInPast(10));
    url.searchParams.set('signature', await createAppProxyHmac(url));

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

  it('Throws a 400 response if there is no session for that shop', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());

    // WHEN
    const url = new URL(APP_URL);
    url.searchParams.set('shop', TEST_SHOP);
    url.searchParams.set('timestamp', secondsInPast(10));
    url.searchParams.set('signature', await createAppProxyHmac(url));

    const response = await getThrownResponse(
      shopify.authenticate.public.appProxy,
      new Request(url.toString()),
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
  });

  it('Returns the session', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig());
    await setUpValidSession(shopify.sessionStorage);

    // WHEN
    const url = new URL(APP_URL);
    url.searchParams.set('shop', TEST_SHOP);
    url.searchParams.set('timestamp', secondsInPast(10));
    url.searchParams.set('signature', await createAppProxyHmac(url));

    const context = await shopify.authenticate.public.appProxy(
      new Request(url.toString()),
    );

    // THEN
    expect(context.session.shop).toBe(TEST_SHOP);
  });

  describe('Returns the admin client', () => {
    it('REST client can perform GET requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.get({path: 'customers'});

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('REST client can perform POST requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'POST'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.post({
        path: '/customers.json',
        data: '',
      });

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('REST client can perform PUT requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'PUT'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.put({
        path: '/customers.json',
        data: '',
      });

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('REST client can perform DELETE requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(REQUEST_URL, {method: 'DELETE'}),
        response: new Response(JSON.stringify({customers: []})),
      });

      // WHEN
      const response = await admin.rest.delete({path: '/customers.json'});

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({customers: []});
    });

    it('GraphQL client can perform requests', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const session = await setUpValidSession(shopify.sessionStorage, false);
      const {admin} = await shopify.unauthenticated.admin(TEST_SHOP);

      await mockExternalRequest({
        request: new Request(
          `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
          {
            method: 'POST',
            headers: {'X-Shopify-Access-Token': session.accessToken!},
          },
        ),
        response: new Response(JSON.stringify({shop: {name: 'Test shop'}})),
      });

      // WHEN
      const response = await admin.graphql('{ shop { name } }');

      // THEN
      expect(response.status).toEqual(200);
      expect(await response.json()).toEqual({shop: {name: 'Test shop'}});
    });

    it('returns a session object as part of the context', async () => {
      // GIVEN
      const shopify = shopifyApp(testConfig());
      const session = await setUpValidSession(shopify.sessionStorage, false);

      // WHEN
      const {session: actualSession} = await shopify.unauthenticated.admin(
        TEST_SHOP,
      );

      // THEN
      expect(actualSession).toEqual(session);
    });
  });
});

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
