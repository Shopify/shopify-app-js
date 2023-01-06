import request from 'supertest';
import express, {Express} from 'express';
import {LATEST_API_VERSION, LogSeverity} from '@shopify/shopify-api';

import {AppInstallations} from '../../app-installations';
import {
  MockBody,
  mockShopifyResponses,
  shopify,
  TEST_SHOP,
  TEST_WEBHOOK_ID,
  validWebhookHeaders,
} from '../test-helper';

import {AppUninstalledTestCase} from './types';
import * as mockResponses from './responses';
import {
  convertBeginResponseToCallbackInfo,
  EVENT_BRIDGE_HANDLER,
  httpHandlerMock,
  HTTP_HANDLER,
  PUBSUB_HANDLER,
} from './utils';

const APP_UNINSTALLED_TEST_CASES: AppUninstalledTestCase[] = [
  {
    handler: {...HTTP_HANDLER, callbackUrl: '/test/webhooks'},
    expectWrap: true,
    mockResponse: mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE,
    expectedQuery: 'webhookSubscriptionCreate(\n      topic: APP_UNINSTALLED',
  },
  {
    handler: {...EVENT_BRIDGE_HANDLER},
    expectWrap: false,
    mockResponse: mockResponses.EVENT_BRIDGE_WEBHOOK_CREATE_RESPONSE,
    expectedQuery:
      'eventBridgeWebhookSubscriptionCreate(\n      topic: APP_UNINSTALLED',
  },
  {
    handler: {...PUBSUB_HANDLER},
    expectWrap: false,
    mockResponse: mockResponses.PUBSUB_WEBHOOK_CREATE_RESPONSE,
    expectedQuery:
      'pubSubWebhookSubscriptionCreate(\n      topic: APP_UNINSTALLED',
  },
];

describe('webhook integration', () => {
  describe('APP_UNINSTALLED wrapping', () => {
    APP_UNINSTALLED_TEST_CASES.forEach((config) => {
      describe(`test ${JSON.stringify(config)}`, () => {
        let app: Express;

        beforeEach(() => {
          shopify.config.webhooks.path = '/test/webhooks';

          app = express();

          // Use a short timeout since everything here should be pretty quick. If you see a `socket hang up` error,
          // it's probably because the timeout is too short.
          app.use('*', (_req, res, next) => {
            res.setTimeout(100);
            next();
          });

          app.get('/test/auth', shopify.auth.begin());
          app.get(
            '/test/auth/callback',
            shopify.auth.callback(),
            shopify.redirectToShopifyOrAppRoot(),
          );
          app.post(
            '/test/webhooks',
            shopify.processWebhooks({
              webhookHandlers: {APP_UNINSTALLED: config.handler},
            }),
          );
        });

        afterEach(() => {
          httpHandlerMock.mockReset();
        });

        it('registers and triggers as expected', async () => {
          const responses: [MockBody][] = [
            [mockResponses.OFFLINE_ACCESS_TOKEN_RESPONSE],
            [mockResponses.EMPTY_WEBHOOK_RESPONSE],
          ];

          if (config.expectWrap) {
            expect(
              shopify.api.config.logger.log as jest.Mock,
            ).toHaveBeenCalledWith(
              LogSeverity.Info,
              expect.stringContaining(
                "Detected multiple handlers for 'APP_UNINSTALLED', webhooks.process will call them sequentially",
              ),
            );
          } else {
            expect(
              shopify.api.config.logger.log as jest.Mock,
            ).not.toHaveBeenCalledWith(
              LogSeverity.Info,
              expect.stringContaining(
                "Detected multiple handlers for 'APP_UNINSTALLED', webhooks.process will call them sequentially",
              ),
            );

            responses.push([config.mockResponse]);
          }

          responses.push([mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE]);

          mockShopifyResponses(...responses);

          await performOAuth(app);

          const webhookQueries = ['webhookSubscriptions('];
          if (!config.expectWrap) {
            webhookQueries.push(config.expectedQuery);
          }
          webhookQueries.push(
            'webhookSubscriptionCreate(\n      topic: APP_UNINSTALLED',
          );

          webhookQueries.forEach((query) =>
            expect({
              method: 'POST',
              url: `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
              body: expect.stringContaining(query),
            }).toMatchMadeHttpRequest(),
          );

          const appInstallations = new AppInstallations(shopify.config);
          expect(await appInstallations.includes(TEST_SHOP)).toBe(true);

          await triggerWebhook(app);

          expect(
            shopify.api.config.logger.log as jest.Mock,
          ).toHaveBeenCalledWith(
            LogSeverity.Info,
            expect.stringContaining(
              'Webhook processed, returned status code 200',
            ),
          );

          expect(await appInstallations.includes(TEST_SHOP)).toBe(false);

          if (config.expectWrap) {
            expect(httpHandlerMock).toHaveBeenCalledWith(
              'APP_UNINSTALLED',
              TEST_SHOP,
              '{}',
              TEST_WEBHOOK_ID,
              LATEST_API_VERSION,
            );
          }
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

async function triggerWebhook(app: Express) {
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
}
