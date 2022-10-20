import express, {Express, Request, Response} from 'express';
import {DeliveryMethod, WebhookHandlerFunction} from '@shopify/shopify-api';
import {ApiAndConfigParams} from 'src/types';

import {AppInstallations} from '../app-installations';
import {createDeleteAppInstallationHandler} from '../middlewares';

import {HttpWebhookHandler, WebhookConfigHandler} from './types';
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

export interface AttachWebhooksParams extends ApiAndConfigParams {
  subApp: Express;
  handlers: WebhookConfigHandler[];
}

export function attachWebhooks({
  api,
  config,
  subApp,
  handlers = [],
}: AttachWebhooksParams): void {
  const appInstallations = new AppInstallations(api);
  const specialWebhookHandlers: HttpWebhookHandler[] = [
    {
      topic: 'APP_UNINSTALLED',
      deliveryMethod: DeliveryMethod.Http,
      handler: createDeleteAppInstallationHandler(appInstallations),
    },
  ];

  config.webhooks.handlers = handlers;

  if (specialWebhookHandlers) {
    loadOrWrapHandlers(config.webhooks.handlers, specialWebhookHandlers);
  }

  addWebhookHandlers({api, config});

  subApp.post(
    config.webhooks.path,
    express.text({type: '*/*'}),
    async (req: Request, res: Response) => {
      process({req, res, api});
    },
  );
}

function loadOrWrapHandlers(
  handlers: WebhookConfigHandler[],
  specialHandlers: WebhookConfigHandler[],
) {
  specialHandlers.forEach((specialHandler) => {
    const handler = handlers.find(
      (handler) => handler.topic === specialHandler.topic,
    );

    if (!handler) {
      handlers.push(specialHandler);
    } else if (handler && handler.deliveryMethod === DeliveryMethod.Http) {
      // there's an existing HTTP handler for this topic, so we'll wrap it
      handler.handler = createWrappingHandler({
        handler: (handler as HttpWebhookHandler).handler,
        specialHandler: (specialHandler as HttpWebhookHandler).handler,
      });
    }
  });
}
