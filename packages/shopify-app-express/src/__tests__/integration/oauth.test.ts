import request from 'supertest';
import express, {Express} from 'express';
import jwt from 'jsonwebtoken';
import {
  ConfigParams,
  LATEST_API_VERSION,
  LogSeverity,
} from '@shopify/shopify-api';

import {shopifyApp} from '../..';
import {WebhookHandlersParam} from '../../webhooks/types';
import {AppInstallations} from '../../app-installations';
import {
  BASE64_HOST,
  createTestHmac,
  MockBody,
  mockShopifyResponse,
  mockShopifyResponses,
  testConfig,
  TEST_SHOP,
  TEST_WEBHOOK_ID,
  validWebhookHeaders,
} from '../test-helper';

import {
  convertBeginResponseToCallbackInfo,
  EVENT_BRIDGE_HANDLER,
  HTTP_HANDLER,
  PUBSUB_HANDLER,
} from './utils';
import {CallbackInfo, OAuthTestCase} from './types';
import * as mockResponses from './responses';

const TEST_CASES: OAuthTestCase[] = [];

// Test all permutations of the configs
// Embedded app
[true, false].forEach((embedded) => {
  // Use online tokens
  [true, false].forEach((online) => {
    // Localhost / tunnel
    [`https://${TEST_SHOP}`, 'http://localhost:1234'].forEach((host) => {
      [true, false].forEach((existingWebhooks) => {
        TEST_CASES.push({embedded, online, host, existingWebhooks});
      });
    });
  });
});

describe('OAuth integration tests', () => {
  TEST_CASES.forEach((config) => {
    it(`test ${JSON.stringify(config)}`, async () => {
      const webhookHandlers: WebhookHandlersParam = {
        TEST_TOPIC: [
          {...HTTP_HANDLER, callbackUrl: '/test/webhooks'},
          {...EVENT_BRIDGE_HANDLER},
          {...PUBSUB_HANDLER},
        ],
      };

      const afterAuth = jest.fn().mockImplementation(async (req, res, next) => {
        const shopSessions = await shopify.config.sessionStorage
          .findSessionsByShop!(TEST_SHOP);
        const offlineSession = shopSessions[0];
        expect(offlineSession.isOnline).toBe(false);

        if (config.online) {
          const onlineSession = shopSessions[1];

          expect(onlineSession.isOnline).toBe(true);
          expect(res.locals.shopify.session).toEqual(onlineSession);
        } else {
          expect(res.locals.shopify.session).toEqual(offlineSession);
        }

        next();
      });
      const installedMock = jest.fn((_req, res) => res.send('ok'));
      const authedMock = jest.fn((_req, res) => res.send('ok'));

      // Create a new instance of the app with the given config
      const url = new URL(config.host);
      const apiConfig: ConfigParams = {
        ...testConfig.api,
        isEmbeddedApp: config.embedded,
        hostScheme: url.protocol.slice(0, -1) as 'http' | 'https',
        hostName: url.host,
      };

      const shopify = shopifyApp({
        ...testConfig,
        api: apiConfig,
        auth: {
          path: '/test/auth',
          callbackPath: '/test/auth/callback',
        },
        webhooks: {
          path: '/test/webhooks',
        },
        useOnlineTokens: config.online,
      });

      const app = express();
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
        afterAuth,
        shopify.redirectToShopifyOrAppRoot(),
      );
      app.post('/test/webhooks', shopify.processWebhooks({webhookHandlers}));
      app.get('/installed', shopify.ensureInstalledOnShop(), installedMock);
      app.get('/authed', shopify.validateAuthenticatedSession(), authedMock);

      const callbackInfo = await beginOAuth(app, shopify, config);

      await completeOAuth(app, shopify, config, callbackInfo, afterAuth);

      assertOAuthRequests(shopify, config, callbackInfo);

      const body = JSON.stringify({'test-body-received': true});
      await webhookProcessRequest('TEST_TOPIC', body, app, shopify);
      expect(HTTP_HANDLER.callback).toHaveBeenCalledWith(
        'TEST_TOPIC',
        TEST_SHOP,
        body,
        TEST_WEBHOOK_ID,
        LATEST_API_VERSION,
      );

      await installedRequest(app, config, installedMock);

      await validSession(app, shopify, config, authedMock);

      await appUninstalledWebhookRequest(app, shopify);
    });
  });
});

// Fires the request to start the OAuth process and asserts it goes as expected
async function beginOAuth(
  app: Express,
  shopify: ShopifyApp,
  config: OAuthTestCase,
) {
  const beginResponse = await request(app)
    .get(`/test/auth?shop=${TEST_SHOP}`)
    .expect(302);

  // We always start with offline tokens
  assertOAuthBeginRedirectUrl(
    config,
    shopify,
    new URL(beginResponse.header.location),
    false,
  );

  return convertBeginResponseToCallbackInfo(
    beginResponse,
    shopify.api.config.apiSecretKey,
    TEST_SHOP,
  );
}

// Fires the request to complete OAuth based on the begin call, and asserts it returns as expected
async function completeOAuth(
  app: Express,
  shopify: ShopifyApp,
  config: OAuthTestCase,
  callbackInfo: CallbackInfo,
  afterAuth: jest.Mock,
) {
  // Make sure there was no session when we started
  expect(
    await shopify.config.sessionStorage.findSessionsByShop!(TEST_SHOP),
  ).toEqual([]);

  mockOAuthResponses(config);

  let finalCallbackInfo: CallbackInfo;

  // When using online tokens, we first get the offline token, then go back to Shopify for the online one
  if (config.online) {
    const onlineCallbackResponse = await request(app)
      .get(`/test/auth/callback?${callbackInfo.params.toString()}`)
      .set('Cookie', callbackInfo.cookies)
      .expect(302);

    // We should have requested an online OAuth
    assertOAuthBeginRedirectUrl(
      config,
      shopify,
      new URL(onlineCallbackResponse.header.location),
      true,
    );

    finalCallbackInfo = convertBeginResponseToCallbackInfo(
      onlineCallbackResponse,
      shopify.api.config.apiSecretKey,
      TEST_SHOP,
    );
  } else {
    finalCallbackInfo = callbackInfo;
  }

  const callbackResponse = await request(app)
    .get(`/test/auth/callback?${callbackInfo.params.toString()}`)
    .set('Cookie', callbackInfo.cookies)
    .expect(302);

  if (config.embedded) {
    const url = new URL(callbackResponse.header.location);
    expect(url.pathname).toBe(`/apps/${shopify.api.config.apiKey}`);
  } else {
    const url = new URL(
      callbackResponse.header.location,
      'http://not-a-real-host',
    );
    expect(url.pathname).toBe(`/`);
    expect(Object.fromEntries(url.searchParams.entries())).toMatchObject({
      shop: TEST_SHOP,
      host: BASE64_HOST,
    });
  }

  expect(afterAuth).toHaveBeenCalledTimes(1);
}

function assertOAuthBeginRedirectUrl(
  config: OAuthTestCase,
  shopify: ShopifyApp,
  url: URL,
  isOnline: boolean,
) {
  expect(url.protocol).toBe('https:');
  expect(url.hostname).toBe(TEST_SHOP);
  expect(url.pathname).toBe('/admin/oauth/authorize');

  const redirecUri = new URL(url.searchParams.get('redirect_uri')!);
  expect(`${redirecUri.protocol}//${redirecUri.host}`).toBe(`${config.host}`);
  expect(redirecUri.pathname).toBe('/test/auth/callback');

  expect(url.searchParams.get('client_id')).toEqual(shopify.api.config.apiKey);
  expect(url.searchParams.get('scope')).toEqual(
    shopify.api.config.scopes.toString(),
  );
  expect(url.searchParams.get('state')).toEqual(expect.stringMatching(/.{15}/));

  if (isOnline) {
    expect(url.searchParams.get('grant_options[]')).toEqual('per-user');
  } else {
    expect(url.searchParams.get('grant_options[]')).toEqual('');
  }
}

// Mock all necessary responses from Shopify for the OAuth process
function mockOAuthResponses(config: OAuthTestCase) {
  const responses: [MockBody][] = [
    [mockResponses.OFFLINE_ACCESS_TOKEN_RESPONSE],
  ];

  if (config.existingWebhooks) {
    responses.push(
      // Make sure we're returning the right host so we trigger updates
      [
        JSON.stringify(mockResponses.EXISTING_WEBHOOK_RESPONSE).replace(
          'https://test_host_name',
          config.host,
        ),
      ],
      [mockResponses.HTTP_WEBHOOK_UPDATE_RESPONSE],
      [mockResponses.EVENT_BRIDGE_WEBHOOK_UPDATE_RESPONSE],
      [mockResponses.PUBSUB_WEBHOOK_UPDATE_RESPONSE],
    );
  } else {
    responses.push(
      [mockResponses.EMPTY_WEBHOOK_RESPONSE],
      [mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE],
      [mockResponses.EVENT_BRIDGE_WEBHOOK_CREATE_RESPONSE],
      [mockResponses.PUBSUB_WEBHOOK_CREATE_RESPONSE],
    );
  }

  // For the custom APP_UNINSTALLED handler
  responses.push([mockResponses.HTTP_WEBHOOK_CREATE_RESPONSE]);

  if (config.online) {
    responses.push([mockResponses.ONLINE_ACCESS_TOKEN_RESPONSE]);
  }

  mockShopifyResponses(...responses);
}

// Asserts that the OAuth process made the expected requests
function assertOAuthRequests(
  shopify: ShopifyApp,
  config: OAuthTestCase,
  callbackInfo: CallbackInfo,
) {
  expect({
    method: 'POST',
    url: `https://${TEST_SHOP}/admin/oauth/access_token`,
    body: {
      client_id: shopify.api.config.apiKey,
      client_secret: shopify.api.config.apiSecretKey,
      code: callbackInfo.params.get('code'),
    },
  }).toMatchMadeHttpRequest();

  const webhookQueries: string[] = [];
  if (config.existingWebhooks) {
    webhookQueries.push(
      'webhookSubscriptions(',
      `webhookSubscriptionUpdate(\n      id: "fakeId",\n      webhookSubscription: {callbackUrl: "${config.host}/test/webhooks"}`,
      'eventBridgeWebhookSubscriptionUpdate(\n      id: "fakeId",\n      webhookSubscription: {arn: "arn:test"}',
      `pubSubWebhookSubscriptionUpdate(\n      id: "fakeId",\n      webhookSubscription: {pubSubProject: "pubSubProject", pubSubTopic: "pubSubTopic"}`,
    );
  } else {
    webhookQueries.push(
      'webhookSubscriptions(',
      `webhookSubscriptionCreate(\n      topic: TEST_TOPIC,\n      webhookSubscription: {callbackUrl: "${config.host}/test/webhooks"}`,
      'eventBridgeWebhookSubscriptionCreate(\n      topic: TEST_TOPIC,\n      webhookSubscription: {arn: "arn:test"}',
      `pubSubWebhookSubscriptionCreate(\n      topic: TEST_TOPIC,\n      webhookSubscription: {pubSubProject: "pubSubProject", pubSubTopic: "pubSubTopic"}`,
    );
  }

  // The final webhook with the custom APP_UNINSTALLED handler
  webhookQueries.push(
    `webhookSubscriptionCreate(\n      topic: APP_UNINSTALLED,\n      webhookSubscription: {callbackUrl: "${config.host}/test/webhooks"}`,
  );

  webhookQueries.forEach((query) =>
    expect({
      method: 'POST',
      url: `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`,
      body: expect.stringContaining(query),
    }).toMatchMadeHttpRequest(),
  );

  // We register webhooks with the offline token, so the request for the online token comes after them
  if (config.online) {
    expect({
      method: 'POST',
      url: `https://${TEST_SHOP}/admin/oauth/access_token`,
      body: {
        client_id: shopify.api.config.apiKey,
        client_secret: shopify.api.config.apiSecretKey,
      },
    }).toMatchMadeHttpRequest();
  }
}

// Fires a request to process an HTTP webhook
async function webhookProcessRequest(
  topic: string,
  body: string,
  app: Express,
  shopify: ShopifyApp,
) {
  await request(app)
    .post('/test/webhooks')
    .set(validWebhookHeaders(topic, body, shopify.api.config.apiSecretKey))
    .send(body)
    .expect(200);

  expect(shopify.api.config.logger.log as jest.Mock).toHaveBeenCalledWith(
    LogSeverity.Info,
    expect.stringContaining('Webhook processed, returned status code 200'),
  );
}

async function appUninstalledWebhookRequest(app: Express, shopify: ShopifyApp) {
  const body = JSON.stringify({'test-body-received': true});
  const appInstallations = new AppInstallations(shopify.config);

  expect(await appInstallations.includes(TEST_SHOP)).toBe(true);

  await webhookProcessRequest('APP_UNINSTALLED', body, app, shopify);

  expect(await appInstallations.includes(TEST_SHOP)).toBe(false);
}

// Fires a valid request to check that the installed middleware allows requests through
async function installedRequest(
  app: Express,
  config: OAuthTestCase,
  mock: jest.Mock,
) {
  const response = await request(app).get(
    `/installed?shop=${TEST_SHOP}&host=${BASE64_HOST}&embedded=1`,
  );

  if (config.embedded) {
    expect(response.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(1);
  } else {
    expect(response.status).toBe(config.embedded ? 500 : 302);
    expect(mock).not.toHaveBeenCalled();
  }
}

// Fires a valid request to check that the authenticated middleware allows requests through
async function validSession(
  app: Express,
  shopify: ShopifyApp,
  config: OAuthTestCase,
  mock: jest.Mock,
) {
  const validJWT = jwt.sign(
    {
      sub: 1234,
      aud: shopify.api.config.apiKey,
      dest: `https://${TEST_SHOP}`,
    },
    shopify.api.config.apiSecretKey,
    {
      algorithm: 'HS256',
    },
  );

  const headers: {[key: string]: string} = {};
  if (config.embedded) {
    headers.Authorization = `Bearer ${validJWT}`;
  } else {
    const session = (
      await shopify.config.sessionStorage.findSessionsByShop!(TEST_SHOP)
    )[0];
    headers.Cookie = [
      `shopify_app_session=${session.id}`,
      `shopify_app_session.sig=${createTestHmac(
        shopify.api.config.apiSecretKey,
        session.id,
      )}`,
    ].join(';');
  }

  mockShopifyResponse({data: {shop: {name: TEST_SHOP}}});

  const response = await request(app).get('/authed').set(headers);

  expect(response.status).toBe(200);
  expect(mock).toHaveBeenCalledTimes(1);
}
