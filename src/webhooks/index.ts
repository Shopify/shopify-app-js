import express, {Request, Response} from 'express';
import {
  AddHandlersParams,
  DeliveryMethod,
  HttpWebhookHandler,
} from '@shopify/shopify-api';

import {AppInstallations} from '../app-installations';
import {createDeleteAppInstallationHandler} from '../middlewares';

import {AttachWebhooksParams, WebhooksMountParams} from './types';
import {process} from './process';

export function attachWebhooks({
  api,
  config,
  subApp,
}: AttachWebhooksParams): void {
  subApp.post(
    config.webhooks.path,
    express.text({type: '*/*'}),
    async (req: Request, res: Response) => {
      process({req, res, api});
    },
  );
}

export function webhooksMount({
  api,
  config,
  handlers = {},
}: WebhooksMountParams) {
  // Make sure all HTTP handlers' callbackUrl points to the webhook route
  Object.entries(handlers).forEach(([_, topicHandlers]) => {
    const handlersArray = Array.isArray(topicHandlers)
      ? topicHandlers
      : [topicHandlers];

    handlersArray.forEach((handler) => {
      if (handler.deliveryMethod === DeliveryMethod.Http) {
        (handler as HttpWebhookHandler).callbackUrl = config.webhooks.path;
      }
    });
  });

  api.webhooks.addHandlers(handlers as AddHandlersParams);

  // Add our custom app uninstalled webhook
  const appInstallations = new AppInstallations();

  api.webhooks.addHandlers({
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: config.webhooks.path,
      callback: createDeleteAppInstallationHandler(appInstallations),
    },
  });
}
