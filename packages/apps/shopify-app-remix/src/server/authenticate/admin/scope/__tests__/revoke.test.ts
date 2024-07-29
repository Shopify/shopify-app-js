import {REAUTH_URL_HEADER} from '../../../const';
import {
  APP_URL,
  TEST_SHOP,
  expectExitIframeRedirect,
  getThrownResponse,
  mockGraphqlRequests,
  setUpEmbeddedFlow,
  setUpFetchFlow,
  setUpNonEmbeddedFlow,
} from '../../../../__test-helpers';

import * as responses from './mock-responses';

it('returns scopes information', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequests()(
    {
      body: 'AppRevokeAccessScopes',
      responseContent: responses.REVOKED_WITHOUT_ERROR,
    },
    {
      body: 'FetchAccessScopes',
      responseContent: responses.WITH_GRANTED_AND_DECLARED,
    },
  );

  // WHEN
  const result = await scopes.revoke(['read_orders']);

  // THEN
  expect(result).not.toBeUndefined();
  expect(result.granted.required).toEqual(['read_orders']);
  expect(result.granted.optional).toEqual(['write_customers']);
  expect(result.declared.required).toEqual(['write_orders', 'read_reports']);
});

it('returns error if the list of scopes is empty', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();

  // WHEN / THEN
  await expect(scopes.revoke([])).rejects.toEqual(
    expect.objectContaining({
      status: 400,
    }),
  );
});

it('returns revoke server errors', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    responseContent: responses.REVOKED_WITH_ERROR,
  });

  // WHEN / THEN
  await expect(scopes.revoke(['invalid_scope'])).rejects.toEqual(
    expect.objectContaining({
      status: 422,
    }),
  );
});

it('redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  const mockedRequests = await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    status: 401,
  });

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.revoke(['read_orders']),
    mockedRequests[0],
  );

  // THEN
  expectExitIframeRedirect(response);
});

it('returns app bridge redirection during request headers when Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow({
    unstable_newEmbeddedAuthStrategy: false,
  });
  const mockedRequests = await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    status: 401,
  });

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.revoke(['read_orders']),
    mockedRequests[0],
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

it('returns a normal redirection when the app is non embedded and Shopify invalidated the session', async () => {
  // GIVEN
  const {scopes} = await setUpNonEmbeddedFlow();
  const mockedRequests = await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    status: 401,
  });

  // WHEN
  const response = await getThrownResponse(
    async () => scopes.revoke(['read_orders']),
    mockedRequests[0],
  );

  // THEN
  expect(response.status).toEqual(302);

  const {hostname, pathname} = new URL(response.headers.get('Location')!);
  expect(hostname).toEqual(TEST_SHOP);
  expect(pathname).toEqual('/admin/oauth/authorize');
});

it('return an unexpected error when there is no authentication error', async () => {
  // GIVEN
  const {scopes} = await setUpFetchFlow({
    unstable_newEmbeddedAuthStrategy: false,
  });
  await mockGraphqlRequests()({
    body: 'AppRevokeAccessScopes',
    status: 500,
  });

  // WHEN / THEN
  await expect(scopes.revoke(['read_orders'])).rejects.toEqual(
    expect.objectContaining({
      status: 500,
    }),
  );
});
