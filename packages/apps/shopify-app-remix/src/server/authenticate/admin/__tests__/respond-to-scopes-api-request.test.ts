import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';
import {ApiVersion} from '@shopify/shopify-api';

import {
  getJwt,
  mockGraphqlRequest,
  mockGraphqlRequests,
  setUpEmbeddedFlow,
  setUpValidSession,
  testConfig,
} from '../../../__test-helpers';
import * as responses from '../scope/__tests__/mock-responses';
import {APP_URL, BASE64_HOST, TEST_SHOP} from '../../../__test-helpers/const';
import {shopifyApp} from '../../../shopify-app';

it('returns not found error when the scopes api is disabled', async () => {
  // WHEN
  try {
    await requestToDisabledScopesApi('query');
  } catch (response) {
    // THEN
    expect(response.status).toEqual(404);
  }
});

it('query request returns scopes information using a different scopes api subpath', async () => {
  // GIVEN
  await mockGraphqlRequest(ApiVersion.Unstable)(
    200,
    responses.WITH_GRANTED_AND_DECLARED,
  );

  // WHEN
  try {
    await requestToScopesApi('query', undefined, '/customscopessubpath');
  } catch (response) {
    // THEN
    expect(response instanceof Response).toBeTruthy();
    const data = await response.json();

    expect(data.granted.required).toEqual(['read_orders']);
    expect(data.granted.optional).toEqual(['write_customers']);
    expect(data.declared.required).toEqual(['write_orders', 'read_reports']);
  }
});

it('query request returns scopes information', async () => {
  // GIVEN
  await mockGraphqlRequest(ApiVersion.Unstable)(
    200,
    responses.WITH_GRANTED_AND_DECLARED,
  );

  // WHEN
  try {
    await requestToScopesApi('query');
  } catch (response) {
    // THEN
    expect(response instanceof Response).toBeTruthy();
    const data = await response.json();

    expect(data.granted.required).toEqual(['read_orders']);
    expect(data.granted.optional).toEqual(['write_customers']);
    expect(data.declared.required).toEqual(['write_orders', 'read_reports']);
  }
});

it('request redirects to install URL when successful', async () => {
  // GIVEN
  await mockGraphqlRequest()(200, responses.WITH_GRANTED_AND_DECLARED);

  // WHEN
  try {
    await requestToScopesApi('request', {
      scopes: ['write_products', 'read_orders', 'write_customers'],
    });
  } catch (response) {
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
    expect(locationParams.get('optional_scopes')).toBe(
      'write_products,read_orders,write_customers',
    );
  }
});

it('revokes request revoke the scope and returns scopes information', async () => {
  // GIVEN
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
  try {
    await requestToScopesApi('revoke', {
      scopes: ['write_products', 'read_orders', 'write_customers'],
    });
  } catch (response) {
    // THEN
    expect(response instanceof Response).toBeTruthy();
    const data = await response.json();

    expect(data.granted.required).toEqual(['read_orders']);
    expect(data.granted.optional).toEqual(['write_customers']);
    expect(data.declared.required).toEqual(['write_orders', 'read_reports']);
  }
});

async function requestToScopesApi(api: string, params?: any, scopesPath = '/scopes') {
  const queryParams = new URLSearchParams(params);
  const queryRequestPath = `${APP_URL}/auth${scopesPath}/${api}?${queryParams.toString()}&`;
  await setUpEmbeddedFlow(queryRequestPath, scopesPath);
}

async function requestToDisabledScopesApi(api: string) {
  const shopify = shopifyApp(
    testConfig({
      authPathPrefix: '/auth',
      future: {
        unstable_newEmbeddedAuthStrategy: false,
        unstable_optionalScopesApi: false,
      },
      restResources,
    }),
  );

  await setUpValidSession(shopify.sessionStorage);

  const {token} = getJwt();
  const request = new Request(
    `${APP_URL}/auth/scopes/${api}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
  );

  await shopify.authenticate.admin(request);
}
