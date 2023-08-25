import {HashFormat, createSHA256HMAC} from '@shopify/shopify-api/runtime';
import {Session} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {shopifyApp} from '../../../..';
import {
  API_SECRET_KEY,
  APP_URL,
  TEST_SHOP,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../../__tests__/test-helper';

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
    it('TODO', () => {
      expect(false).toBe(true);
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
