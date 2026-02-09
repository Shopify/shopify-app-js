import request from 'supertest';

import {ShopifyHeader} from '../../types';
import {WebhookValidationErrorReason} from '../types';
import {Shopify, shopifyApi} from '../..';
import {testConfig} from '../../__tests__/test-config';

import {getTestExpressApp, headers, hmac} from './utils';

describe('shopify.webhooks.validate', () => {
  const rawBody = '{"foo": "bar"}';

  it('returns true for valid request', async () => {
    const shopify = shopifyApi(testConfig());
    const app = getTestApp(shopify);

    const response = await request(app)
      .post('/webhooks')
      .set(headers({hmac: hmac(shopify.config.apiSecretKey, rawBody)}))
      .send(rawBody)
      .expect(200);

    expect(response.body.data).toEqual({
      valid: true,
      webhookId: '123456789',
      apiVersion: '2023-01',
      domain: 'shop1.myshopify.io',
      hmac: 'B23tXN681gZ0qIWNRrgtzBE9XSDo5yaUu6wfmhu3a7g=',
      topic: 'PRODUCTS_CREATE',
      webhookType: 'webhooks',
    });
  });

  it.each([
    {headers: {apiVersion: ''}, missingHeader: ShopifyHeader.ApiVersion},
    {headers: {domain: ''}, missingHeader: ShopifyHeader.Domain},
    {headers: {topic: ''}, missingHeader: ShopifyHeader.Topic},
    {headers: {webhookId: ''}, missingHeader: ShopifyHeader.WebhookId},
  ])(`returns false on missing header $missingHeader`, async (config) => {
    const shopify = shopifyApi(testConfig());
    const app = getTestApp(shopify);

    const requestHeaders = headers({
      hmac: hmac(shopify.config.apiSecretKey, rawBody),
      ...config.headers,
    });

    const response = await request(app)
      .post('/webhooks')
      .set(requestHeaders)
      .send(rawBody)
      .expect(200);

    expect(response.body.data).toEqual({
      valid: false,
      reason: WebhookValidationErrorReason.MissingHeaders,
      missingHeaders: [config.missingHeader],
    });
  });

  it('returns false on missing body', async () => {
    const shopify = shopifyApi(testConfig());
    const app = getTestApp(shopify);

    const response = await request(app)
      .post('/webhooks')
      .set(headers({hmac: hmac(shopify.config.apiSecretKey, rawBody)}))
      .expect(200);

    expect(response.body.data).toEqual({
      valid: false,
      reason: WebhookValidationErrorReason.MissingBody,
    });
  });

  it('returns false on missing HMAC', async () => {
    const shopify = shopifyApi(testConfig());
    const app = getTestApp(shopify);

    const response = await request(app)
      .post('/webhooks')
      .set(headers({hmac: ''}))
      .send(rawBody)
      .expect(200);

    expect(response.body.data).toEqual({
      valid: false,
      reason: WebhookValidationErrorReason.MissingHmac,
    });
  });

  it('returns false on invalid HMAC', async () => {
    const shopify = shopifyApi(testConfig());
    const app = getTestApp(shopify);

    const response = await request(app)
      .post('/webhooks')
      .set(headers())
      .send(rawBody)
      .expect(200);

    expect(response.body.data).toEqual({
      valid: false,
      reason: WebhookValidationErrorReason.InvalidHmac,
    });
  });

  describe('events webhook validation', () => {
    it('validates events webhooks with lowercase headers', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(
          headers({
            hmac: hmac(shopify.config.apiSecretKey, rawBody),
            webhookType: 'events',
            topic: 'Product',
            action: 'create',
            handle: 'my-webhook',
            resourceId: 'gid://shopify/Product/123',
          }),
        )
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        webhookType: 'events',
        topic: 'PRODUCT',
        domain: 'shop1.myshopify.io',
        action: 'create',
        handle: 'my-webhook',
        resourceId: 'gid://shopify/Product/123',
      });
    });

    it('returns webhookType: webhooks for traditional webhooks', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({hmac: hmac(shopify.config.apiSecretKey, rawBody)}))
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        webhookType: 'webhooks',
      });
    });

    it('extracts events-specific optional fields', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(
          headers({
            hmac: hmac(shopify.config.apiSecretKey, rawBody),
            webhookType: 'events',
            handle: 'test-handle',
            action: 'update',
            resourceId: 'gid://shopify/Product/456',
            triggeredAt: '2026-01-27T12:00:00Z',
            eventId: 'event-123',
          }),
        )
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        handle: 'test-handle',
        action: 'update',
        resourceId: 'gid://shopify/Product/456',
        triggeredAt: '2026-01-27T12:00:00Z',
        eventId: 'event-123',
      });
    });

    it('extracts webhooks name field', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(
          headers({
            hmac: hmac(shopify.config.apiSecretKey, rawBody),
            name: 'my-webhook-name',
          }),
        )
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        webhookType: 'webhooks',
        name: 'my-webhook-name',
      });
    });
  });

  it.each([
    {headers: {apiVersion: ''}, missingHeader: 'shopify-api-version'},
    {headers: {domain: ''}, missingHeader: 'shopify-shop-domain'},
    {headers: {topic: ''}, missingHeader: 'shopify-topic'},
    {headers: {eventId: '', webhookId: ''}, missingHeader: 'shopify-event-id'},
  ])(
    `returns false on missing events header $missingHeader`,
    async (config) => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const requestHeaders = headers({
        hmac: hmac(shopify.config.apiSecretKey, rawBody),
        webhookType: 'events',
        eventId: 'event-123',
        ...config.headers,
      });

      const response = await request(app)
        .post('/webhooks')
        .set(requestHeaders)
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toEqual({
        valid: false,
        reason: WebhookValidationErrorReason.MissingHeaders,
        missingHeaders: [config.missingHeader],
      });
    },
  );

  it('returns false on invalid events HMAC', async () => {
    const shopify = shopifyApi(testConfig());
    const app = getTestApp(shopify);

    const response = await request(app)
      .post('/webhooks')
      .set(headers({webhookType: 'events'}))
      .send(rawBody)
      .expect(200);

    expect(response.body.data).toEqual({
      valid: false,
      reason: WebhookValidationErrorReason.InvalidHmac,
    });
  });

  it('returns false on missing events body', async () => {
    const shopify = shopifyApi(testConfig());
    const app = getTestApp(shopify);

    const response = await request(app)
      .post('/webhooks')
      .set(
        headers({
          hmac: hmac(shopify.config.apiSecretKey, rawBody),
          webhookType: 'events',
        }),
      )
      .expect(200);

    expect(response.body.data).toEqual({
      valid: false,
      reason: WebhookValidationErrorReason.MissingBody,
    });
  });

  describe('webhook type detection', () => {
    it('detects webhooks when X-Shopify-Hmac-Sha256 present', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({hmac: hmac(shopify.config.apiSecretKey, rawBody)}))
        .send(rawBody)
        .expect(200);

      expect(response.body.data.webhookType).toBe('webhooks');
    });

    it('detects events when both header formats are present', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(
          headers({
            hmac: hmac(shopify.config.apiSecretKey, rawBody),
            webhookType: 'events',
            topic: 'Product',
            handle: 'my_first_subscription',
            action: 'update',
            resourceId: 'gid://shopify/Product/123',
          }),
        )
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        webhookType: 'events',
        topic: 'PRODUCT',
        handle: 'my_first_subscription',
        action: 'update',
        resourceId: 'gid://shopify/Product/123',
      });
    });
  });
});

function getTestApp(shopify: Shopify) {
  const app = getTestExpressApp();
  app.post('/webhooks', async (req, res) => {
    res.status(200).json({
      data: await shopify.webhooks.validate({
        rawBody: (req as any).rawBody,
        rawRequest: req,
        rawResponse: res,
      }),
    });
  });

  return app;
}
