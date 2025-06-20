import {
  BillingConfigSubscriptionLineItemPlan,
  BillingError,
  BillingInterval,
  HttpResponseError,
  SESSION_COOKIE_NAME,
} from '@shopify/shopify-api';

import {shopifyApp} from '../../../..';
import {
  APP_URL,
  BASE64_HOST,
  GRAPHQL_URL,
  TEST_SHOP,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
  testConfig,
  mockExternalRequest,
  mockExternalRequests,
} from '../../../../__test-helpers';
import {REAUTH_URL_HEADER} from '../../../const';

import * as responses from './mock-responses';

const BILLING_CONFIG = {
  [responses.PLAN_1]: {
    lineItems: [
      {
        amount: 5,
        currencyCode: 'USD',
        interval: BillingInterval.Usage,
        terms: 'Usage based',
      },
    ],
  } as BillingConfigSubscriptionLineItemPlan,
};

describe('Update usage billing plan capped amount', () => {
  it('redirects to exit-iframe with payment confirmation URL when successful using app bridge when embedded', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(
        responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE,
      ),
    });

    const {token} = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
    );

    const {billing} = await shopify.authenticate.admin(request);

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    expectExitIframeRedirect(response, {
      destination: responses.CONFIRMATION_URL,
      addHostToExitIframePath: false,
    });
  });

  it('returns redirection headers when successful during fetch requests', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(
        responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE,
      ),
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
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    expect(response.status).toEqual(401);
    expect(response.headers.get(REAUTH_URL_HEADER)).toEqual(
      responses.CONFIRMATION_URL,
    );
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
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
        }),
      request,
    );

    // THEN
    const shopSession = await config.sessionStorage.loadSession(
      `offline_${TEST_SHOP}`,
    );
    expect(shopSession).toBeDefined();
    expect(shopSession!.accessToken).toBeUndefined();

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
        billing.updateUsageCappedAmount({
          subscriptionLineItemId:
            responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
          cappedAmount: {amount: 10, currencyCode: 'USD'},
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
  it('throws a BillingError when the response contains user errors', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(
        responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE_WITH_USER_ERRORS,
      ),
    });

    const {token} = getJwt();
    const {billing} = await shopify.authenticate.admin(
      new Request(
        `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
      ),
    );

    // THEN
    await expect(
      billing.updateUsageCappedAmount({
        subscriptionLineItemId:
          responses.UPDATE_USAGE_CAPPED_AMOUNT_SUBSCRIPTION_ID,
        cappedAmount: {amount: 10, currencyCode: 'USD'},
      }),
    ).rejects.toThrow(BillingError);
  });
});
