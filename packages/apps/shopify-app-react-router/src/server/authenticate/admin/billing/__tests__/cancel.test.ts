import {
  BillingConfigSubscriptionLineItemPlan,
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
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  getJwt,
  getThrownResponse,
  setUpValidSession,
  signRequestCookie,
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

describe('Cancel billing', () => {
  it('returns an AppSubscription when the cancellation is successful', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    const {billing} = await shopify.authenticate.admin(
      new Request(`${APP_URL}/billing`, {
        headers: {Authorization: `Bearer ${getJwt().token}`},
      }),
    );

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(responses.CANCEL_RESPONSE),
    });

    // WHEN
    const subscription = await billing.cancel({
      subscriptionId: '123',
      isTest: true,
      prorate: true,
    });

    // THEN
    expect(subscription).toEqual(responses.APP_SUBSCRIPTION);
  });

  it('redirects to authentication when at the top level when Shopify invalidated the session', async () => {
    // GIVEN
    const config = testConfig({isEmbeddedApp: false, billing: BILLING_CONFIG});
    const shopify = shopifyApp(config);
    const session = await setUpValidSession(shopify.sessionStorage);

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const {billing} = await shopify.authenticate.admin(request);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.cancel({
          subscriptionId: '123',
          isTest: true,
          prorate: true,
        }),
      request,
    );

    // THEN
    expectBeginAuthRedirect(config, response);
  });

  it('redirects to exit-iframe with authentication using app bridge when embedded and Shopify invalidated the session', async () => {
    // GIVEN
    const config = testConfig();
    const shopify = shopifyApp({...config, billing: BILLING_CONFIG});
    await setUpValidSession(shopify.sessionStorage);

    const {token} = getJwt();
    const request = new Request(
      `${APP_URL}/billing?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
    );

    const {billing} = await shopify.authenticate.admin(request);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.cancel({
          subscriptionId: '123',
          isTest: true,
          prorate: true,
        }),
      request,
    );

    // THEN
    const shopSession = await config.sessionStorage.loadSession(
      `offline_${TEST_SHOP}`,
    );
    expect(shopSession).toBeDefined();
    expect(shopSession!.accessToken).toBeUndefined();
    expectExitIframeRedirect(response);
  });

  it('returns redirection headers during fetch requests when Shopify invalidated the session', async () => {
    // GIVEN
    const shopify = shopifyApp(testConfig({billing: BILLING_CONFIG}));
    await setUpValidSession(shopify.sessionStorage);

    const request = new Request(`${APP_URL}/billing`, {
      headers: {
        Authorization: `Bearer ${getJwt().token}`,
      },
    });

    const {billing} = await shopify.authenticate.admin(request);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      }),
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        billing.cancel({
          subscriptionId: '123',
          isTest: true,
          prorate: true,
        }),
      request,
    );

    // THEN
    const {origin, pathname} = new URL(
      response.headers.get(REAUTH_URL_HEADER)!,
    );

    expect(response.status).toEqual(401);
    expect(origin).toEqual(APP_URL);
    expect(pathname).toEqual('/auth');
  });

  it('throws errors other than authentication errors', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({isEmbeddedApp: false, billing: BILLING_CONFIG}),
    );
    const session = await setUpValidSession(shopify.sessionStorage);

    await mockExternalRequest({
      request: new Request(GRAPHQL_URL, {method: 'POST', body: 'test'}),
      response: new Response(undefined, {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    });

    const request = new Request(`${APP_URL}/billing?shop=${TEST_SHOP}`);
    signRequestCookie({
      request,
      cookieName: SESSION_COOKIE_NAME,
      cookieValue: session.id,
    });

    const {billing} = await shopify.authenticate.admin(request);

    // THEN
    await expect(
      billing.cancel({
        subscriptionId: '123',
        isTest: true,
        prorate: true,
      }),
    ).rejects.toThrowError(HttpResponseError);
  });
});
