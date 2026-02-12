import crypto from 'crypto';

import express from 'express';

import {ShopifyHeader} from '../../types';
import {WEBHOOK_HEADER_NAMES, WebhookTypeValue} from '../types';

export function getTestExpressApp() {
  const parseRawBody = (req: any, _res: any, next: any) => {
    req.setEncoding('utf8');
    req.rawBody = '';
    req.on('data', (chunk: any) => {
      req.rawBody += chunk;
    });
    req.on('end', () => {
      next();
    });
  };

  const app = express();
  app.use(parseRawBody);
  return app;
}

export function headers({
  apiVersion = '2023-01',
  domain = 'shop1.myshopify.io',
  hmac = 'fake',
  topic = 'products/create',
  webhookId = '123456789',
  subTopic = '',
  lowercase = false,
  webhookType = 'webhooks' as WebhookTypeValue,
  // Events-specific fields
  handle = '',
  action = '',
  resourceId = '',
  triggeredAt = '',
  eventId = '',
  // Webhooks specific
  name = '',
}: {
  apiVersion?: string;
  domain?: string;
  hmac?: string;
  topic?: string;
  webhookId?: string;
  subTopic?: string;
  lowercase?: boolean;
  webhookType?: WebhookTypeValue;
  handle?: string;
  action?: string;
  resourceId?: string;
  triggeredAt?: string;
  eventId?: string;
  name?: string;
} = {}) {
  if (webhookType === 'events') {
    const eventsHeaders = WEBHOOK_HEADER_NAMES.events;
    return {
      [ShopifyHeader.ApiVersion]: apiVersion,
      [ShopifyHeader.Domain]: domain,
      [ShopifyHeader.Hmac]: hmac,
      [ShopifyHeader.Topic]: topic,
      [ShopifyHeader.WebhookId]: webhookId,
      // Events shopify-* headers
      [eventsHeaders.apiVersion]: apiVersion,
      [eventsHeaders.domain]: domain,
      [eventsHeaders.hmac]: hmac,
      [eventsHeaders.topic]: topic,
      [eventsHeaders.eventId]: eventId || webhookId,
      ...(handle && {[eventsHeaders.handle]: handle}),
      ...(action && {[eventsHeaders.action]: action}),
      ...(resourceId && {[eventsHeaders.resourceId]: resourceId}),
      ...(triggeredAt && {[eventsHeaders.triggeredAt]: triggeredAt}),
    };
  }

  // Webhooks headers
  return {
    [lowercase
      ? ShopifyHeader.ApiVersion.toLowerCase()
      : ShopifyHeader.ApiVersion]: apiVersion,
    [lowercase ? ShopifyHeader.Domain.toLowerCase() : ShopifyHeader.Domain]:
      domain,
    [lowercase ? ShopifyHeader.Hmac.toLowerCase() : ShopifyHeader.Hmac]: hmac,
    [lowercase ? ShopifyHeader.Topic.toLowerCase() : ShopifyHeader.Topic]:
      topic,
    [lowercase
      ? ShopifyHeader.WebhookId.toLowerCase()
      : ShopifyHeader.WebhookId]: webhookId,
    ...(subTopic
      ? {
          [lowercase
            ? ShopifyHeader.SubTopic.toLowerCase()
            : ShopifyHeader.SubTopic]: subTopic,
        }
      : {}),
    ...(name && {[lowercase ? 'x-shopify-name' : 'X-Shopify-Name']: name}),
    ...(triggeredAt && {
      [lowercase ? 'x-shopify-triggered-at' : 'X-Shopify-Triggered-At']:
        triggeredAt,
    }),
    ...(eventId && {
      [lowercase ? 'x-shopify-event-id' : 'X-Shopify-Event-Id']: eventId,
    }),
  };
}

export function hmac(secret: string, body: string) {
  return crypto.createHmac('sha256', secret).update(body).digest('base64');
}
