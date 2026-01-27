// packages/apps/shopify-api/lib/webhooks/header-names.ts
export const WebhookType = {
  Webhooks: 'webhooks',
  NextGen: 'nge',
} as const;

export type WebhookTypeValue = (typeof WebhookType)[keyof typeof WebhookType];

export const WEBHOOK_HEADER_NAMES = {
  [WebhookType.Webhooks]: {
    hmac: 'X-Shopify-Hmac-Sha256',
    topic: 'X-Shopify-Topic',
    domain: 'X-Shopify-Shop-Domain',
    apiVersion: 'X-Shopify-API-Version',
    webhookId: 'X-Shopify-Webhook-Id',
    subTopic: 'X-Shopify-Sub-Topic',
    name: 'X-Shopify-Name',
    triggeredAt: 'X-Shopify-Triggered-At',
    eventId: 'X-Shopify-Event-Id',
  },
  [WebhookType.NextGen]: {
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
