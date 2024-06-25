import {SESSION_COOKIE_NAME} from '@shopify/shopify-api';

import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from '../../../../__test-helpers';
import {shopifyApp} from '../../../..';
import * as redirect from '../../helpers/redirect-to-install-page';

it('when the future flag is disabled returns an error', async () => {
  // GIVEN
  const shopify = shopifyApp(
    testConfig({
      isEmbeddedApp: false,
      scopes: undefined,
      future: {unstable_optionalScopesApi: false},
    }),
  );
  const session = await setUpValidSession(shopify.sessionStorage);

  const request = new Request(`${APP_URL}/scopes`);
  signRequestCookie({
    request,
    cookieName: SESSION_COOKIE_NAME,
    cookieValue: session.id,
  });

  // WHEN
  const adminApi = await shopify.authenticate.admin(request);

  // THEN
  expect(adminApi).not.toHaveProperty('scopes');
});

it('when scopes are empty the request is not redirected', async () => {
  // GIVEN
  const shopify = shopifyApp(
    testConfig({
      isEmbeddedApp: false,
      scopes: undefined,
      future: {unstable_optionalScopesApi: true},
    }),
  );
  const session = await setUpValidSession(shopify.sessionStorage);

  const request = new Request(`${APP_URL}/scopes`);
  signRequestCookie({
    request,
    cookieName: SESSION_COOKIE_NAME,
    cookieValue: session.id,
  });

  const spyRedirect = jest.spyOn(redirect, 'redirectToInstallPage');


  // WHEN
  const {scopes} = await shopify.authenticate.admin(request);
  const response = await scopes.request([]);

  // THEN
  expect(response).toBeUndefined();
  expect(spyRedirect).not.toHaveBeenCalled();
});

describe('request from a non embedded app', () => {
  it('redirects to install URL when successful', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({isEmbeddedApp: false, scopes: undefined}),
    );
    const session = await setUpValidSession(shopify.sessionStorage);

    const request = new Request(`${APP_URL}/scopes`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const {scopes} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => scopes.request(['write_products']),
      request,
    );

    // THEN
    expect(response.status).toEqual(302);
    const locationHeader = response.headers.get('Location');
    expect(locationHeader).not.toBeUndefined();
    const location = new URL(locationHeader!);
    expect(location.hostname).toBe(TEST_SHOP);
    expect(location.pathname).toBe('/admin/oauth/install');
    const locationParams = location.searchParams;
    expect(locationParams.get('optional_scopes')).toBe('write_products');
  });
});

describe('request from an embedded app', () => {
  it('redirects to install URL when successful', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({scopes: undefined}));
    await setUpValidSession(shopify.sessionStorage);

    const {token} = getJwt();
    const request = new Request(
      `${APP_URL}/scopes?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
    );

    const {scopes} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () => scopes.request(['write_products']),
      request,
    );

    // THEN
    expect(response.status).toEqual(401);
    const reuthorizeHeader = response.headers.get(
      'x-shopify-api-request-failure-reauthorize-url',
    );
    expect(reuthorizeHeader).not.toBeUndefined();
    const location = new URL(reuthorizeHeader!);
    expect(location.hostname).toBe(TEST_SHOP);
    expect(location.pathname).toBe('/admin/oauth/install');
    const locationParams = location.searchParams;
    expect(locationParams.get('optional_scopes')).toBe('write_products');
  });
});
