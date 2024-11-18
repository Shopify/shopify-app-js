import {
  BillingConfig,
  BillingConfigUsageLineItem,
  BillingError,
  BillingInterval,
  shopifyApi,
} from '../..';
import {TEST_FUTURE_FLAGS, testConfig} from '../../__tests__/test-config';
import {queueMockResponses} from '../../__tests__/test-helper';
import {Session} from '../../session/session';
import {
  DOMAIN,
  ACCESS_TOKEN,
  GRAPHQL_BASE_REQUEST,
} from '../../__test-helpers__';

import * as Responses from './responses';

describe('shopify.billing.updateUsageCappedAmount', () => {
  const session = new Session({
    id: '1234',
    shop: DOMAIN,
    state: '1234',
    isOnline: true,
    accessToken: ACCESS_TOKEN,
  });

  const billing: BillingConfig<typeof TEST_FUTURE_FLAGS> = {
    'Sample Usage Plan': {
      lineItems: [
        {
          interval: BillingInterval.Usage,
          amount: 1.99,
          currencyCode: 'USD',
          terms: 'Sample Terms',
        } as BillingConfigUsageLineItem,
      ],
    },
  };

  it('updates the usage subscription capped amount successfully', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([
      Responses.USAGE_SUBSRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE,
    ]);

    const response = await shopify.billing.updateUsageCappedAmount({
      session,
      subscriptionLineItemId: Responses.USAGE_CHARGE_SUBSCRIPTION_ID,
      cappedAmount: {amount: 100, currencyCode: 'USD'},
    });

    expect(response).toEqual(
      Responses.UPDATE_CAPPED_AMOUNT_CONFIRMATION_RESPONSE,
    );

    expect({
      ...GRAPHQL_BASE_REQUEST,
      data: {
        query: expect.stringContaining('appSubscriptionLineItemUpdate'),
        variables: expect.objectContaining({
          cappedAmount: {amount: 100, currencyCode: 'USD'},
        }),
      },
    }).toMatchMadeHttpRequest();
  });

  it('throws a BillingError when no billing config is set', async () => {
    const shopify = shopifyApi(testConfig({billing: undefined}));

    await expect(() =>
      shopify.billing.updateUsageCappedAmount({
        session,
        subscriptionLineItemId: '1234',
        cappedAmount: {amount: 100, currencyCode: 'USD'},
      }),
    ).rejects.toThrow(BillingError);
  });

  it('throws a BillingError when an error occurs in the GraphQL query', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([
      Responses.USAGE_SUBSCRIPTION_CAPPED_AMOUNT_UPDATE_RESPONSE_ERROR,
    ]);

    await expect(() =>
      shopify.billing.updateUsageCappedAmount({
        session,
        subscriptionLineItemId: Responses.USAGE_CHARGE_SUBSCRIPTION_ID,
        cappedAmount: {amount: 100, currencyCode: 'USD'},
      }),
    ).rejects.toThrow(BillingError);
  });
});
