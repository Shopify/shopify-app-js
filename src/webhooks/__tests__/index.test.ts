import request from 'supertest';
import express, {Express} from 'express';
import {DeliveryMethod} from '@shopify/shopify-api';

import {
  assertShopifyAuthRequestMade,
  convertBeginResponseToCallbackInfo,
  mockShopifyResponses,
  TEST_SHOP,
  validWebhookHeaders,
  testConfig,
} from '../../__tests__/test-helper';
import {ShopifyApp} from '../../types';
import {shopifyApp} from '../..';
import {WebhookConfigHandler} from '../types';
import {AppInstallations} from '../../app-installations';

describe('shopify.webhooks', () => {
  let app: Express;
  let shopify: ShopifyApp;
  let httpMock: jest.Mock;

  let consoleLogMock: jest.SpyInstance;
  beforeEach(() => {
    consoleLogMock = jest.spyOn(global.console, 'log').mockImplementation();

    httpMock = jest.fn();

    const handlers: WebhookConfigHandler[] = [
      {
        deliveryMethod: DeliveryMethod.Http,
        topic: 'TEST_TOPIC',
        handler: httpMock,
      },
    ];

    shopify = shopifyApp(testConfig);

    app = express();
    app.use(shopify.auth());
    app.use('/test', shopify.webhooks({handlers}));
  });

  afterEach(() => {
    consoleLogMock.mockRestore();
  });

  it('registers webhooks after auth', async () => {
    await performOauth(app, shopify.api.config.apiSecretKey);

    assertGraphqlQueryBody(
      'webhookSubscriptions(first: 1, topics: TEST_TOPIC)',
    );
    assertGraphqlQueryBody(
      'webhookSubscriptionCreate(topic: TEST_TOPIC, webhookSubscription: {callbackUrl: "https://my-test-app.myshopify.io/test/webhooks"})',
    );
  });

  it('updates registrations if they exist', async () => {
    await performOauth(app, shopify.api.config.apiSecretKey, true);

    assertGraphqlQueryBody(
      'webhookSubscriptions(first: 1, topics: TEST_TOPIC)',
    );
    assertGraphqlQueryBody(
      'webhookSubscriptionUpdate(id: "fakeId", webhookSubscription: {callbackUrl: "https://my-test-app.myshopify.io/test/webhooks"})',
    );
  });

  it('responds to webhook process requests', async () => {
    await performOauth(app, shopify.api.config.apiSecretKey);

    const body = JSON.stringify({});

    await request(app)
      .post('/test/webhooks')
      .set(
        validWebhookHeaders(
          'TEST_TOPIC',
          body,
          shopify.api.config.apiSecretKey,
        ),
      )
      .send(body)
      .expect(200);

    expect(httpMock).toHaveBeenCalledWith('TEST_TOPIC', TEST_SHOP, body);
    expect(consoleLogMock).toHaveBeenCalledWith(
      'Webhook processed, returned status code 200',
    );
  });

  it('deletes sessions on APP_UNINSTALLED by default', async () => {
    await performOauth(app, shopify.api.config.apiSecretKey);

    const appInstallations = new AppInstallations(shopify.api);

    expect(await appInstallations.includes(TEST_SHOP)).toBe(true);

    const body = JSON.stringify({});

    await request(app)
      .post('/test/webhooks')
      .set(
        validWebhookHeaders(
          'APP_UNINSTALLED',
          body,
          shopify.api.config.apiSecretKey,
        ),
      )
      .send(body)
      .expect(200);

    expect(await appInstallations.includes(TEST_SHOP)).toBe(false);
    expect(consoleLogMock).toHaveBeenCalledWith(
      'Webhook processed, returned status code 200',
    );
  });
});

describe('with all webhook types', () => {
  let app: Express;
  let shopify: ShopifyApp;
  let httpMock: jest.Mock;

  let consoleLogMock: jest.SpyInstance;
  beforeEach(() => {
    consoleLogMock = jest.spyOn(global.console, 'log').mockImplementation();

    httpMock = jest.fn();

    const handlers: WebhookConfigHandler[] = [
      {
        deliveryMethod: DeliveryMethod.Http,
        topic: 'TEST_TOPIC',
        handler: httpMock,
      },
      {
        deliveryMethod: DeliveryMethod.EventBridge,
        topic: 'EB_TOPIC',
        address: 'eventbridge-address',
      },
      {
        deliveryMethod: DeliveryMethod.PubSub,
        topic: 'PUBSUB_TOPIC',
        address: 'pubsub:address',
      },
    ];

    shopify = shopifyApp(testConfig);

    app = express();
    app.use(shopify.auth());
    app.use('/test', shopify.webhooks({handlers}));
  });

  afterEach(() => {
    consoleLogMock.mockRestore();
  });

  it('registers all types of webhooks', async () => {
    const beginResponse = await request(app)
      .get(`/auth?shop=${TEST_SHOP}`)
      .expect(302);

    const callbackInfo = convertBeginResponseToCallbackInfo(
      beginResponse,
      shopify.api.config.apiSecretKey,
      TEST_SHOP,
    );

    mockShopifyResponses(
      [ACCESS_TOKEN_RESPONSE],
      [EMPTY_WEBHOOK_RESPONSE],
      [HTTP_WEBHOOK_CREATE_RESPONSE],
      [EMPTY_WEBHOOK_RESPONSE],
      [EVENT_BRIDGE_WEBHOOK_CREATE_RESPONSE],
      [EMPTY_WEBHOOK_RESPONSE],
      [PUBSUB_WEBHOOK_CREATE_RESPONSE],
      // the next two are for APP_UNINSTALLED
      [EMPTY_WEBHOOK_RESPONSE],
      [HTTP_WEBHOOK_CREATE_RESPONSE],
    );

    await request(app)
      .get(`/auth/callback?${callbackInfo.params.toString()}`)
      .set('Cookie', callbackInfo.cookies)
      .expect(302);

    assertShopifyAuthRequestMade(TEST_SHOP, callbackInfo);

    assertGraphqlQueryBody(
      'webhookSubscriptions(first: 1, topics: TEST_TOPIC)',
    );
    assertGraphqlQueryBody(
      'webhookSubscriptionCreate(topic: TEST_TOPIC, webhookSubscription: {callbackUrl: "https://my-test-app.myshopify.io/test/webhooks"})',
    );
    assertGraphqlQueryBody('webhookSubscriptions(first: 1, topics: EB_TOPIC)');
    assertGraphqlQueryBody(
      'eventBridgeWebhookSubscriptionCreate(topic: EB_TOPIC, webhookSubscription: {arn: "eventbridge-address"})',
    );
    assertGraphqlQueryBody(
      'webhookSubscriptions(first: 1, topics: PUBSUB_TOPIC)',
    );
    assertGraphqlQueryBody(
      `pubSubWebhookSubscriptionCreate(topic: PUBSUB_TOPIC, webhookSubscription: {pubSubProject: "pubsub",\n                                  pubSubTopic: "address"})`,
    );
  });
});

async function performOauth(
  app: Express,
  secret: string,
  existingWebhook = false,
): Promise<void> {
  const beginResponse = await request(app)
    .get(`/auth?shop=${TEST_SHOP}`)
    .expect(302);

  const callbackInfo = convertBeginResponseToCallbackInfo(
    beginResponse,
    secret,
    TEST_SHOP,
  );

  if (existingWebhook) {
    mockShopifyResponses(
      [ACCESS_TOKEN_RESPONSE],
      [EXISTING_WEBHOOK_RESPONSE],
      [HTTP_WEBHOOK_UPDATE_RESPONSE],
      // the next two are for APP_UNINSTALLED
      [EXISTING_WEBHOOK_RESPONSE],
      [HTTP_WEBHOOK_UPDATE_RESPONSE],
    );
  } else {
    mockShopifyResponses(
      [ACCESS_TOKEN_RESPONSE],
      [EMPTY_WEBHOOK_RESPONSE],
      [HTTP_WEBHOOK_CREATE_RESPONSE],
      // the next two are for APP_UNINSTALLED
      [EMPTY_WEBHOOK_RESPONSE],
      [HTTP_WEBHOOK_CREATE_RESPONSE],
    );
  }

  await request(app)
    .get(`/auth/callback?${callbackInfo.params.toString()}`)
    .set('Cookie', callbackInfo.cookies)
    .expect(302);

  assertShopifyAuthRequestMade(TEST_SHOP, callbackInfo);
}

function assertGraphqlQueryBody(body: string) {
  expect({
    method: 'POST',
    url: `https://${TEST_SHOP}/admin/api/2022-10/graphql.json`,
    body: expect.stringContaining(body),
  }).toMatchMadeHttpRequest();
}

const ACCESS_TOKEN_RESPONSE = {
  access_token: 'totally-real-access-token',
  scope: 'read_products',
};

const EMPTY_WEBHOOK_RESPONSE = {data: {webhookSubscriptions: {edges: []}}};

const EXISTING_WEBHOOK_RESPONSE = {
  data: {
    webhookSubscriptions: {
      edges: [
        {
          node: {
            id: 'fakeId',
            endpoint: {
              __typename: 'WebhookHttpEndpoint',
              callbackUrl: 'https://test_host_name/webhooks',
            },
          },
        },
      ],
    },
  },
};

const HTTP_WEBHOOK_CREATE_RESPONSE = {
  data: {
    webhookSubscriptionCreate: {webhookSubscription: {id: 'fakeId'}},
  },
};

const HTTP_WEBHOOK_UPDATE_RESPONSE = {
  data: {
    webhookSubscriptionUpdate: {webhookSubscription: {id: 'fakeId'}},
  },
};

const EVENT_BRIDGE_WEBHOOK_CREATE_RESPONSE = {
  data: {
    eventBridgeWebhookSubscriptionCreate: {
      webhookSubscription: {id: 'fakeId'},
    },
  },
};

const PUBSUB_WEBHOOK_CREATE_RESPONSE = {
  data: {
    pubSubWebhookSubscriptionCreate: {
      webhookSubscription: {id: 'fakeId'},
    },
  },
};
