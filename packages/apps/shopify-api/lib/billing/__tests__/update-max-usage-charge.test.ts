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

import * as Responses from './responses';

const DOMAIN = 'test-shop.myshopify.io';
const ACCESS_TOKEN = 'access-token';

describe('shopify.billing.updateMaxUsageCharge', () => {
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

  it('updates the max usage charge successfully', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.MAX_USAGE_CHARGE_UPDATE_RESPONSE]);

    const response = await shopify.billing.updateMaxUsageCharge({
      session,
      subscriptionLineItemId: Responses.USAGE_CHARGE_SUBSCRIPTION_ID,
      cappedAmount: {amount: 100, currencyCode: 'USD'},
    });

    expect(response).toEqual(
      Responses.APP_SUBSCRIPTION_LINE_ITEM_UPDATE_PAYLOAD,
    );
  });

  it('throws a BillingError when no billing config is set', async () => {
    const shopify = shopifyApi(testConfig({billing: undefined}));

    const response = shopify.billing.updateMaxUsageCharge({
      session,
      subscriptionLineItemId: '1234',
      cappedAmount: {amount: 100, currencyCode: 'USD'},
    });

    expect(response).rejects.toThrow(BillingError);
  });
});
