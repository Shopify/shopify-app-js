import express, {Request, Response} from 'express';
import {DeliveryMethod, WebhookHandlerFunction} from '@shopify/shopify-api';

import {
  CreateWebhookAppParams,
  HttpWebhookHandler,
  WebhooksMiddleware,
  WebhookConfigHandler,
} from './types';
import {process} from './process';
import {addWebhookHandlers} from './add-webhook-handlers';

interface CreateWrappingHandlerParams {
  handler: WebhookHandlerFunction;
  specialHandler: WebhookHandlerFunction;
}

function createWrappingHandler({
  handler,
  specialHandler,
}: CreateWrappingHandlerParams) {
  return async function wrappingHandler(
    topic: string,
    shop: string,
    body: string,
  ): Promise<void> {
    await handler(topic, shop, body);
    await specialHandler(topic, shop, body);
  };
}

export function createWebhookApp({
  api,
  config,
  specialWebhookHandlers,
}: CreateWebhookAppParams): WebhooksMiddleware {
  return function webhookApp(webhooksParams = {}) {
    config.webhooks.handlers = webhooksParams.handlers || [];

    if (specialWebhookHandlers) {
      loadOrWrapHandlers(config.webhooks.handlers, specialWebhookHandlers);
    }

    const webhookApp = express();

    webhookApp.on('mount', () => {
      const mountPath = webhookApp.mountpath as string;

      config.webhooks.path = `${mountPath}${config.webhooks.path}`;

      addWebhookHandlers({api, config});
    });

    webhookApp.post(
      config.webhooks.path,
      express.text({type: '*/*'}),
      async (req: Request, res: Response) => {
        process({req, res, api});
      },
    );

    return webhookApp;
  };
}

function loadOrWrapHandlers(
  handlers: WebhookConfigHandler[],
  specialHandlers: WebhookConfigHandler[],
) {
  specialHandlers.forEach((specialHandler) => {
    const handler = handlers.find(
      (handler) => handler.topic === specialHandler.topic,
    );

    if (handler && handler.deliveryMethod === DeliveryMethod.Http) {
      // there's an existing handler for this topic, so we'll wrap it
      handler.handler = createWrappingHandler({
        handler: (handler as HttpWebhookHandler).handler,
        specialHandler: (specialHandler as HttpWebhookHandler).handler,
      });
    } else {
      handlers.push(specialHandler);
    }
  });
}
