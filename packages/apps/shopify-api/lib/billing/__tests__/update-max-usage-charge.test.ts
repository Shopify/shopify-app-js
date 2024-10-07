import {
  BillingConfig,
  BillingConfigUsageLineItem,
  BillingError,
  BillingInterval,
  shopifyApi,
} from '../..';
import {TEST_FUTURE_FLAGS, testConfig} from '../../__tests__/test-config';
import {Session} from '../../session/session';
// import {LATEST_API_VERSION} from '../../types';

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
    // Test implementation goes here
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

  it('throws a BillingError when the update fails', async () => {
    // refactor to actually test the error
    const shopify = shopifyApi(testConfig({billing}));

    const response = shopify.billing.updateMaxUsageCharge({
      session,
      subscriptionLineItemId: '1234',
      cappedAmount: {amount: 100, currencyCode: 'USD'},
    });

    expect(response).rejects.toThrow(BillingError);
  });
});
