import {
  BillingConfigSubscriptionLineItemPlan,
  BillingInterval,
  HttpResponseError,
} from '@shopify/shopify-api';

import {shopifyApp} from '../../../..';
import {
  APP_URL,
  BASE64_HOST,
  GRAPHQL_URL,
  TEST_SHOP,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  testConfig,
  mockExternalRequest,
} from '../../../../__test-helpers';
import {REAUTH_URL_HEADER} from '../../../const';

import * as responses from './mock-responses';

const BILLING_CONFIG = {
  [responses.PLAN_1]: {
    lineItems: [
      {
        amount: 5,
        currencyCode: 'USD',
        interval: BillingInterval.Every30Days,
      },
    ],
  } as BillingConfigSubscriptionLineItemPlan,
};

describe('Billing require', () => {
  it('throws the returned response from onFailure when there is no payment', async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({...config, billing: BILLING_CONFIG});

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(responses.EMPTY_SUBSCRIPTIONS),
    });

    const {billing} = await shopify.authenticate.admin(
      new Request(`${APP_URL}/billing`, {
        headers: {
          Authorization: `Bearer ${getJwt().token}`,
        },
      }),
    );

    // WHEN
    try {
      await billing.require({
        plans: [responses.PLAN_1],
        onFailure: async (error) => {
          expect(error.message).toBe('Billing check failed');
          return new Response('Test response', {status: 402});
        },
      });
    } catch (response) {
      expect(response.status).toBe(402);
      expect(await response.text()).toBe('Test response');
    }
  });

  it('returns true when there is payment', async () => {
    // GIVEN
    const config = testConfig();
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp({...config, billing: BILLING_CONFIG});

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(responses.EXISTING_SUBSCRIPTION),
    });

    const {billing} = await shopify.authenticate.admin(
      new Request(`${APP_URL}/billing`, {
        headers: {
          Authorization: `Bearer ${getJwt().token}`,
        },
      }),
    );

    // WHEN
    const result = await billing.require({
      plans: [responses.PLAN_1],
      onFailure: async () => {
        throw new Error('This should not be called');
      },
    });

    // THEN
    expect(result.hasActivePayment).toBe(true);
    expect(result.oneTimePurchases).toEqual([]);
    expect(result.appSubscriptions).toEqual([
      {id: 'gid://123', name: responses.PLAN_1, test: true},
    ]);
  });

  it('redirects to exit-iframe with authentication using app bridge when Shopify invalidated the session', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp({...config, billing: BILLING_CONFIG});
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    const {token} = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
    );

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.require({
          plans: [responses.PLAN_1],
          isTest: true,
          onFailure: async () => {
            throw new Error('This should not be called');
          },
        }),
      request,
    );

    // THEN
    // Expect Token Exchange behavior: redirect to session-token path
    expect(response.status).toBe(302);
    const {pathname} = new URL(response.headers.get('location')!, APP_URL);
    expect(pathname).toBe('/auth/session-token');
  });

  it('returns redirection headers during fetch requests when Shopify invalidated the session', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.require({
          plans: [responses.PLAN_1],
          isTest: true,
          onFailure: async () => {
            throw new Error('This should not be called');
          },
        }),
      request,
    );

    // THEN
    expect(response.status).toEqual(401);

    // Expect Token Exchange behavior: retry header instead of reauth URL
    expect(
      response.headers.get('X-Shopify-Retry-Invalid-Session-Request'),
    ).toEqual('1');
    expect(response.headers.get(REAUTH_URL_HEADER)).toBeNull();
  });

  it('throws errors other than authentication errors', async () => {
    // GIVEN
    const config = testConfig({billing: BILLING_CONFIG});
    await setUpValidSession(config.sessionStorage);
    const shopify = shopifyApp(config);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    });

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const {billing} = await shopify.authenticate.admin(request);

    // THEN
    await expect(
      billing.require({
        plans: [responses.PLAN_1],
        onFailure: async () => {
          throw new Error('This should not be called');
        },
      }),
    ).rejects.toThrowError(HttpResponseError);
  });
});
