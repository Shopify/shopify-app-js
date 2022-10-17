import {DeliveryMethod} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

export function addWebhookHandlers({api, config}: ApiAndConfigParams): void {
  config.webhooks.handlers.forEach((entry) => {
    if (entry.deliveryMethod === DeliveryMethod.Http) {
      api.webhooks.addHttpHandler({
        topic: entry.topic,
        handler: entry.handler,
      });
    }
  });
}
