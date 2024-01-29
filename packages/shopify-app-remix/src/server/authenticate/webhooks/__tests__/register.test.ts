import {DeliveryMethod, GraphqlQueryError, Session} from '@shopify/shopify-api';

import {shopifyApp} from '../../..';
import {
  GRAPHQL_URL,
  TEST_SHOP,
  testConfig,
  mockExternalRequests,
} from '../../../__test-helpers';

import * as mockResponses from './mock-responses';

describe('Webhook registration', () => {
  it('registers webhooks', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({
        webhooks: {
          PRODUCTS_CREATE: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: '/webhooks',
          },
        },
      }),
    );
    const session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: 'test',
      accessToken: 'totally_real_token',
    });

    await mockExternalRequests(
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptions',
        }),
        response: new Response(
          JSON.stringify(mockResponses.EMPTY_WEBHOOK_RESPONSE),
        ),
      },
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptionCreate',
        }),
        response: new Response(
          JSON.stringify(mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE),
        ),
      },
    );

    // WHEN
    const results = await shopify.registerWebhooks({session});

    // THEN
    expect(results).toMatchObject({
      PRODUCTS_CREATE: [expect.objectContaining({success: true})],
    });
  });

  it('logs when registration fails', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({
        webhooks: {
          NOT_A_VALID_TOPIC: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: '/webhooks',
          },
        },
      }),
    );
    const session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: 'test',
      accessToken: 'totally_real_token',
    });

    await mockExternalRequests(
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptions',
        }),
        response: new Response(
          JSON.stringify(mockResponses.EMPTY_WEBHOOK_RESPONSE),
        ),
      },
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptionCreate',
        }),
        response: new Response(
          JSON.stringify(mockResponses.HTTP_WEBHOOK_CREATE_ERROR_RESPONSE),
        ),
      },
    );

    // WHEN
    const results = await shopify.registerWebhooks({session});

    // THEN
    expect(results).toMatchObject({
      NOT_A_VALID_TOPIC: [expect.objectContaining({success: false})],
    });
  });

  // eslint-disable-next-line no-warning-comments
  // TODO: Remove tests once we have a better solution to parallel afterAuth calls
  it('logs throttling errors', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({
        webhooks: {
          NOT_A_VALID_TOPIC: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: '/webhooks',
          },
        },
      }),
    );
    const session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: 'test',
      accessToken: 'totally_real_token',
    });

    await mockExternalRequests(
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptions',
        }),
        response: new Response(
          JSON.stringify(mockResponses.EMPTY_WEBHOOK_RESPONSE),
        ),
      },
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptionCreate',
        }),
        response: new Response(
          JSON.stringify(mockResponses.HTTP_WEBHOOK_THROTTLING_ERROR_RESPONSE),
        ),
      },
    );

    // WHEN
    const results = await shopify.registerWebhooks({session});

    // THEN
    expect(results).toBeUndefined();
  });

  it('throws other errors', async () => {
    // GIVEN
    const shopify = shopifyApp(
      testConfig({
        webhooks: {
          NOT_A_VALID_TOPIC: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: '/webhooks',
          },
        },
      }),
    );
    const session = new Session({
      id: `offline_${TEST_SHOP}`,
      shop: TEST_SHOP,
      isOnline: false,
      state: 'test',
      accessToken: 'totally_real_token',
    });

    await mockExternalRequests(
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptions',
        }),
        response: new Response(
          JSON.stringify(mockResponses.EMPTY_WEBHOOK_RESPONSE),
        ),
      },
      {
        request: new Request(GRAPHQL_URL, {
          method: 'POST',
          body: 'webhookSubscriptionCreate',
        }),
        response: new Response(
          JSON.stringify({errors: [{extensions: {code: 'FAILED_REQUEST'}}]}),
        ),
      },
    );

    // THEN
    expect(shopify.registerWebhooks({session})).rejects.toThrowError(
      GraphqlQueryError,
    );
  });
});
