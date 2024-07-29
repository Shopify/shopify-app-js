import {queueMockResponses} from '../../__tests__/test-helper';
import {testConfig} from '../../__tests__/test-config';
import {Session} from '../../session/session';
import {LATEST_API_VERSION} from '../../types';
import {shopifyApi, BillingInterval, BillingError} from '../..';

import * as Responses from './responses';

const DOMAIN = 'test-shop.myshopify.io';
const ACCESS_TOKEN = 'access-token';
const GRAPHQL_BASE_REQUEST = {
  method: 'POST',
  domain: DOMAIN,
  path: `/admin/api/${LATEST_API_VERSION}/graphql.json`,
  headers: {'X-Shopify-Access-Token': ACCESS_TOKEN},
};

describe('shopify.billing.subscriptions', () => {
  const session = new Session({
    id: '1234',
    shop: DOMAIN,
    state: '1234',
    isOnline: true,
    accessToken: ACCESS_TOKEN,
    scope: 'read_returns',
  });

  describe('Returns a list of subscriptions', () => {
    it('with a billing config', async () => {
      const shopify = shopifyApi(
        testConfig({
          billing: {
            basic: {
              amount: 5.0,
              currencyCode: 'USD',
              interval: BillingInterval.OneTime,
            },
          },
        }),
      );

      queueMockResponses([Responses.SUBSCRIPTIONS_RESPONSE]);

      const response = await shopify.billing.subscriptions({
        session,
      });

      expect(response).toEqual(
        JSON.parse(Responses.SUBSCRIPTIONS_RESPONSE).data
          .currentAppInstallation,
      );
      expect({
        ...GRAPHQL_BASE_REQUEST,
        data: {
          query: expect.stringContaining('currentAppInstallation'),
        },
      }).toMatchMadeHttpRequest();
    });

    it('without a billing config', async () => {
      const shopify = shopifyApi(testConfig());

      queueMockResponses([Responses.SUBSCRIPTIONS_RESPONSE]);

      const response = await shopify.billing.subscriptions({
        session,
      });

      expect(response).toEqual(
        JSON.parse(Responses.SUBSCRIPTIONS_RESPONSE).data
          .currentAppInstallation,
      );
      expect({
        ...GRAPHQL_BASE_REQUEST,
        data: {
          query: expect.stringContaining('currentAppInstallation'),
        },
      }).toMatchMadeHttpRequest();
    });

    it('throws error without a billing config and no future flag', async () => {
      const shopify = shopifyApi(
        testConfig({future: {unstable_managedPricingSupport: false}}),
      );

      await expect(
        shopify.billing.subscriptions({
          session,
        }),
      ).rejects.toThrow(BillingError);
    });
  });
});
