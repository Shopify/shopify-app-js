import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  mockExternalRequest,
  setUpValidSession,
  testConfig,
} from '../../../../__test-helpers';
import {LATEST_API_VERSION, shopifyApp} from '../../../..';
import {REAUTH_URL_HEADER} from '../../../const';

import * as responses from './mock-responses';

it('returns scopes information', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequest(200, responses.WITH_GRANTED_AND_DECLARED);

  // WHEN
  const result = await scopes.query();

  // THEN
  expect(result).not.toBeUndefined();
  expect(result.granted.required).toEqual(['read_orders']);
  expect(result.granted.optional).toEqual(['write_customers']);
  expect(result.declared.required).toEqual(['write_orders', 'read_reports']);
});

it('redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  const requestMock = await mockGraphqlRequest(401);

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.query(),
    requestMock,
  );

  // THEN
  expectExitIframeRedirect(response);
});

it('returns app bridge redirection during request headers when Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow();
  const requestMock = await mockGraphqlRequest(401);

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.query(),
    requestMock,
  );

  // THEN
  expect(response.status).toEqual(401);

  const {origin, pathname, searchParams} = new URL(
    response.headers.get(REAUTH_URL_HEADER)!,
  );
  expect(origin).toEqual(APP_URL);
  expect(pathname).toEqual('/auth');
  expect(searchParams.get('shop')).toEqual(TEST_SHOP);
});

it('return an unexpected error when there is no authentication error', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow();
  await mockGraphqlRequest(500);

  // WHEN / THEN
  try {
    await scopes.query();
  } catch (error) {
    expect(error.status).toEqual(500);
  }
});

async function setUpEmbeddedFlow() {
  const shopify = shopifyApp(
    testConfig({
      future: {unstable_newEmbeddedAuthStrategy: false},
    }),
  );
  const expectedSession = await setUpValidSession(shopify.sessionStorage);

  const {token} = getJwt();
  const request = new Request(
    `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
  );

  return {
    shopify,
    expectedSession,
    ...(await shopify.authenticate.admin(request)),
  };
}

async function setUpFetchFlow() {
  const shopify = shopifyApp(
    testConfig({
      future: {unstable_newEmbeddedAuthStrategy: false},
    }),
  );
  await setUpValidSession(shopify.sessionStorage);

  const {token} = getJwt();
  const request = new Request(APP_URL, {
    headers: {Authorization: `Bearer ${token}`},
  });

  return {
    shopify,
    ...(await shopify.authenticate.admin(request)),
  };
}

async function mockGraphqlRequest(status = 401, responseContent?: string) {
  const requestMock = new Request(
    `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
    {method: 'POST'},
  );

  await mockExternalRequest({
    request: requestMock,
    response: new Response(responseContent, {status}),
  });

  return requestMock;
}
