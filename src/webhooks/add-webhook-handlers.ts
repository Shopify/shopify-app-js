import {DeliveryMethod} from '@shopify/shopify-api';

import {AddWebhookHandlersParams} from './types';

export function addWebhookHandlers({
  api,
  config,
}: AddWebhookHandlersParams): void {
  config.webhooks.handlers.forEach((entry) => {
    if (entry.deliveryMethod === DeliveryMethod.Http) {
      api.webhooks.addHttpHandler({
        topic: entry.topic,
        handler: entry.handler,
      });
    }
  });
}
