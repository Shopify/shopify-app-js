import {queueMockResponses} from '../../__tests__/test-helper';
import {testConfig} from '../../__tests__/test-config';
import {Session} from '../../session/session';
import {
  shopifyApi,
  BillingError,
  BillingInterval,
  BillingConfigOneTimePlan,
} from '../..';
import {
  DOMAIN,
  ACCESS_TOKEN,
  GRAPHQL_BASE_REQUEST,
} from '../../__test-helpers__';

import * as Responses from './responses';

describe('shopify.billing.cancel', () => {
  const session = new Session({
    id: '1234',
    shop: DOMAIN,
    state: '1234',
    isOnline: true,
    accessToken: ACCESS_TOKEN,
    scope: 'read_returns',
  });

  const billing = {
    basic: {
      amount: 5.0,
      currencyCode: 'USD',
      interval: BillingInterval.OneTime,
    } as BillingConfigOneTimePlan,
  };

  test('returns the details of the subscription successfully cancelled', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.CANCEL_RESPONSE]);

    const {
      data: {
        currentAppInstallation: {activeSubscriptions},
      },
    } = Responses.EXISTING_SUBSCRIPTION_OBJECT;

    const subscriptionId = activeSubscriptions[0].id;
    const response = await shopify.billing.cancel({session, subscriptionId});

    expect(response).toEqual(
      JSON.parse(Responses.CANCEL_RESPONSE).data.appSubscriptionCancel
        .appSubscription,
    );
    expect({
      ...GRAPHQL_BASE_REQUEST,
      data: {
        query: expect.stringContaining('appSubscriptionCancel'),
        variables: expect.objectContaining({
          id: subscriptionId,
          prorate: true,
        }),
      },
    }).toMatchMadeHttpRequest();
  });

  test('throws a BillingError when an error occurs', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.CANCEL_RESPONSE_WITH_USER_ERRORS]);

    const {
      data: {
        currentAppInstallation: {activeSubscriptions},
      },
    } = Responses.EXISTING_SUBSCRIPTION_OBJECT;

    const subscriptionId = activeSubscriptions[0].id;

    expect(() =>
      shopify.billing.cancel({session, subscriptionId}),
    ).rejects.toThrow(BillingError);
  });

  test('throws a BillingError when a user error occurs', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.CANCEL_RESPONSE_WITH_ERRORS]);

    const {
      data: {
        currentAppInstallation: {activeSubscriptions},
      },
    } = Responses.EXISTING_SUBSCRIPTION_OBJECT;

    const subscriptionId = activeSubscriptions[0].id;

    expect(() =>
      shopify.billing.cancel({session, subscriptionId}),
    ).rejects.toThrow(BillingError);
  });

  test('throws a BillingError when a user error occurs', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.CANCEL_RESPONSE_WITH_USER_ERRORS]);

    const {
      data: {
        currentAppInstallation: {activeSubscriptions},
      },
    } = Responses.EXISTING_SUBSCRIPTION_OBJECT;

    const subscriptionId = activeSubscriptions[0].id;

    expect(() =>
      shopify.billing.cancel({session, subscriptionId}),
    ).rejects.toThrow(BillingError);
  });

  test('throws a BillingError when an error occurs', async () => {
    const shopify = shopifyApi(testConfig({billing}));
    queueMockResponses([Responses.CANCEL_RESPONSE_WITH_ERRORS]);

    const {
      data: {
        currentAppInstallation: {activeSubscriptions},
      },
    } = Responses.EXISTING_SUBSCRIPTION_OBJECT;

    const subscriptionId = activeSubscriptions[0].id;

    expect(() =>
      shopify.billing.cancel({session, subscriptionId}),
    ).rejects.toThrow(BillingError);
  });
});
