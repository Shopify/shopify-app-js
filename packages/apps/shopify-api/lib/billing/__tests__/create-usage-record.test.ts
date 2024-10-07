import {queueMockResponses} from '../../__tests__/test-helper';
import {testConfig, TEST_FUTURE_FLAGS} from '../../__tests__/test-config';
import {
  DOMAIN,
  ACCESS_TOKEN,
  GRAPHQL_BASE_REQUEST,
} from '../../__test-helpers__';
import {Session} from '../../session/session';
import {
  shopifyApi,
  BillingError,
  BillingInterval,
  BillingConfigUsageLineItem,
  BillingConfig,
} from '../..';

import * as Responses from './responses';

describe('shopify.billing.createUsageRecord', () => {
  const session = new Session({
    id: '1234',
    shop: DOMAIN,
    state: '1234',
    isOnline: true,
    accessToken: ACCESS_TOKEN,
    scope: 'read_returns',
  });

  const billing: BillingConfig<typeof TEST_FUTURE_FLAGS> = {
    usage: {
      lineItems: [
        {
          interval: BillingInterval.Usage,
          amount: 5.0,
          currencyCode: 'USD',
          terms: '1 dollar per usage',
        } as BillingConfigUsageLineItem,
      ],
    },
  };

  test('returns the details of the usage record created, when passing the subscription line item ID', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.USAGE_RECORD_CREATE_RESPONSE]);

    const description = Responses.USAGE_RECORD_DESCRIPTION;
    const price = Responses.USAGE_RECORD_PRICE;
    const subscriptionId = Responses.USAGE_RECORD_SUBSCRIPTION_ID;
    const response = await shopify.billing.createUsageRecord({
      session,
      description,
      price,
      subscriptionLineItemId: subscriptionId,
    });

    expect(response).toEqual(Responses.APP_USAGE_RECORD);
    expect({
      ...GRAPHQL_BASE_REQUEST,
      data: {
        query: expect.stringContaining('appUsageRecordCreate'),
        variables: expect.objectContaining({
          description,
        }),
      },
    }).toMatchMadeHttpRequest();
  });

  test('returns the details of the usage record created, when using idemptotency key', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.USAGE_RECORD_CREATE_IDEMPOTENCY_RESPONSE]);

    const description = Responses.USAGE_RECORD_DESCRIPTION;
    const price = Responses.USAGE_RECORD_PRICE;
    const subscriptionId = Responses.USAGE_RECORD_SUBSCRIPTION_ID;
    const response = await shopify.billing.createUsageRecord({
      session,
      description,
      price,
      subscriptionLineItemId: subscriptionId,
      idempotencyKey: 'idempotency-key',
    });

    const expectedResponse = JSON.parse(Responses.USAGE_RECORD_CREATE_RESPONSE)
      .data.appUsageRecordCreate.appUsageRecord;
    expectedResponse.idempotencyKey = 'idempotency-key';
    expect(response).toEqual(expectedResponse);
    expect({
      ...GRAPHQL_BASE_REQUEST,
      data: {
        query: expect.stringContaining('appUsageRecordCreate'),
        variables: expect.objectContaining({
          description,
          idempotencyKey: 'idempotency-key',
        }),
      },
    }).toMatchMadeHttpRequest();
  });

  test('returns the details of the usage record created when not passing the subscription line item id', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses(
      [Responses.SUBSCRIPTIONS_WITH_USAGE_PLANS_RESPONSE],
      [Responses.USAGE_RECORD_CREATE_RESPONSE],
    );

    const description = Responses.USAGE_RECORD_DESCRIPTION;
    const price = Responses.USAGE_RECORD_PRICE;
    const response = await shopify.billing.createUsageRecord({
      session,
      description,
      price,
    });

    expect(response).toEqual(Responses.APP_USAGE_RECORD);
    expect({
      ...GRAPHQL_BASE_REQUEST,
      data: {
        query: expect.stringContaining('appSubscription'),
      },
    }).toMatchMadeHttpRequest();
    expect({
      ...GRAPHQL_BASE_REQUEST,
      data: {
        query: expect.stringContaining('appUsageRecordCreate'),
        variables: expect.objectContaining({
          description,
        }),
      },
    }).toMatchMadeHttpRequest();
  });

  test('throws a BillingError when an error occurs', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.USAGE_RECORD_CREATE_RESPONSE_ERROR]);

    const description = Responses.USAGE_RECORD_DESCRIPTION;
    const price = Responses.USAGE_RECORD_PRICE;
    const subscriptionId = Responses.USAGE_RECORD_SUBSCRIPTION_ID;

    expect(() =>
      shopify.billing.createUsageRecord({
        session,
        description,
        price,
        subscriptionLineItemId: subscriptionId,
      }),
    ).rejects.toThrowError(BillingError);
  });

  test('throws a BillingError when an error when no active payment', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([
      Responses.SUBSCRIPTIONS_WITH_USAGE_PLANS_NOT_ACTIVE_RESPONSE,
    ]);

    const description = Responses.USAGE_RECORD_DESCRIPTION;
    const price = Responses.USAGE_RECORD_PRICE;

    expect(() =>
      shopify.billing.createUsageRecord({
        session,
        description,
        price,
      }),
    ).rejects.toThrowError(BillingError);
  });
});
