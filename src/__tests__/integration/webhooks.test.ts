import request from 'supertest';
import express, {Express} from 'express';

import {AppInstallations} from '../../app-installations';
import {
  mockShopifyResponses,
  shopify,
  TEST_SHOP,
  validWebhookHeaders,
} from '../test-helper';

import {AppUninstalledtestCase} from './types';
import * as mockResponses from './responses';
import {
  convertBeginResponseToCallbackInfo,
  EVENT_BRIDGE_HANDLER,
  httpHandlerMock,
  HTTP_HANDLER,
  PUBSUB_HANDLER,
} from './utils';

const APP_UNINSTALLED_TEST_CASES: AppUninstalledtestCase[] = [
  {
    handler: {...HTTP_HANDLER, topic: 'APP_UNINSTALLED'},
    expectWrap: true,
    mockResponse: mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE,
    expectedQuery: 'webhookSubscriptionCreate(topic: APP_UNINSTALLED',
  },
  {
    handler: {...EVENT_BRIDGE_HANDLER, topic: 'APP_UNINSTALLED'},
    expectWrap: false,
    mockResponse: mockResponses.EVENT_BRIDGE_WEBHOOK_CREATE_RESPONSE,
    expectedQuery:
      'eventBridgeWebhookSubscriptionCreate(topic: APP_UNINSTALLED',
  },
  {
    handler: {...PUBSUB_HANDLER, topic: 'APP_UNINSTALLED'},
    expectWrap: false,
    mockResponse: mockResponses.PUBSUB_WEBHOOK_CREATE_RESPONSE,
    expectedQuery: 'pubSubWebhookSubscriptionCreate(topic: APP_UNINSTALLED',
  },
];

describe('webhook integration', () => {
  describe('APP_UNINSTALLED wrapping', () => {
    APP_UNINSTALLED_TEST_CASES.forEach((config) => {
      describe(`test ${JSON.stringify(config)}`, () => {
        let app: Express;
        beforeEach(() => {
          app = express();

          // Use a short timeout since everything here should be pretty quick. If you see a `socket hang up` error,
          // it's probably because the timeout is too short.
          app.use('*', (_req, res, next) => {
            res.setTimeout(100);
            next();
          });

          app.use('/test', shopify.app({webhookHandlers: [config.handler]}));
        });

        afterEach(() => {
          httpHandlerMock.mockReset();
        });

        it('registers and triggers as expected', async () => {
          mockShopifyResponses(
            [mockResponses.OFFLINE_ACCESS_TOKEN_RESPONSE],
            // For the handler we're testing
            [mockResponses.EMPTY_WEBHOOK_RESPONSE],
            [config.mockResponse],
          );

          await performOAuth(app);

          // For the handler we're testing
          const webhookQueries = [
            'webhookSubscriptions(first: 1, topics: APP_UNINSTALLED)',
            config.expectedQuery,
          ];

          webhookQueries.forEach((query) =>
            expect({
              method: 'POST',
              url: `https://${TEST_SHOP}/admin/api/2022-10/graphql.json`,
              body: expect.stringContaining(query),
            }).toMatchMadeHttpRequest(),
          );

          const appInstallations = new AppInstallations(shopify.api);
          expect(await appInstallations.includes(TEST_SHOP)).toBe(true);

          const consoleLogMock = jest
            .spyOn(global.console, 'log')
            .mockImplementation();

          await triggerWebhook(app, config.expectWrap ? 200 : 404);

          if (config.expectWrap) {
            expect(httpHandlerMock).toHaveBeenCalledWith(
              'APP_UNINSTALLED',
              TEST_SHOP,
              '{}',
            );
            expect(await appInstallations.includes(TEST_SHOP)).toBe(false);
            expect(consoleLogMock).toHaveBeenCalledWith(
              'Webhook processed, returned status code 200',
            );
          } else {
            expect(httpHandlerMock).not.toHaveBeenCalled();
            expect(await appInstallations.includes(TEST_SHOP)).toBe(true);
            expect(consoleLogMock).toHaveBeenCalledWith(
              'Failed to process webhook: Error: No webhook is registered for topic APP_UNINSTALLED',
            );
          }

          consoleLogMock.mockRestore();
        });
      });
    });
  });
});

async function performOAuth(app: Express) {
  const beginResponse = await request(app)
    .get(`/test/auth?shop=${TEST_SHOP}`)
    .expect(302);

  const callbackInfo = convertBeginResponseToCallbackInfo(
    beginResponse,
    shopify.api.config.apiSecretKey,
    TEST_SHOP,
  );

  await request(app)
    .get(`/test/auth/callback?${callbackInfo.params.toString()}`)
    .set('Cookie', callbackInfo.cookies)
    .expect(302);

  expect({
    method: 'POST',
    url: `https://${TEST_SHOP}/admin/oauth/access_token`,
    body: {
      client_id: shopify.api.config.apiKey,
      client_secret: shopify.api.config.apiSecretKey,
      code: callbackInfo.params.get('code'),
    },
  }).toMatchMadeHttpRequest();
}

async function triggerWebhook(app: Express, expectedCode: number) {
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
    .expect(expectedCode);
}
