import {ShopifyHeader} from '../types';

export const WebhookType = {
  Webhooks: 'webhooks',
  Events: 'events',
} as const;

export type WebhookTypeValue = (typeof WebhookType)[keyof typeof WebhookType];

export const WEBHOOK_HEADER_NAMES = {
  [WebhookType.Webhooks]: {
    hmac: ShopifyHeader.Hmac,
    topic: ShopifyHeader.Topic,
    domain: ShopifyHeader.Domain,
    apiVersion: ShopifyHeader.ApiVersion,
    webhookId: ShopifyHeader.WebhookId,
    subTopic: ShopifyHeader.SubTopic,
    name: ShopifyHeader.Name,
    triggeredAt: ShopifyHeader.TriggeredAt,
    eventId: ShopifyHeader.EventId,
  },
  [WebhookType.Events]: {
    hmac: 'shopify-hmac-sha256',
    topic: 'shopify-topic',
    domain: 'shopify-shop-domain',
    apiVersion: 'shopify-api-version',
    eventId: 'shopify-event-id',
    handle: 'shopify-handle',
    action: 'shopify-action',
    resourceId: 'shopify-resource-id',
    triggeredAt: 'shopify-triggered-at',
  },
} as const;
