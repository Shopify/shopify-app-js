import express, {Request, Response} from 'express';
import {AddHandlersParams, DeliveryMethod, Shopify} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';
import {ApiAndConfigParams} from '../types';
import {AppInstallations} from '../app-installations';
import {deleteAppInstallationHandler} from '../middlewares';

import {
  ProcessWebhooksMiddleware,
  ProcessWebhooksMiddlewareParams,
  WebhookHandlersParam,
} from './types';
import {process} from './process';

export function processWebhooks({
  api,
  config,
}: ApiAndConfigParams): ProcessWebhooksMiddleware {
  return function ({webhookHandlers}: ProcessWebhooksMiddlewareParams) {
    mountWebhooks(api, config, webhookHandlers);

    return [
      express.text({type: '*/*'}),
      async (req: Request, res: Response) => {
        await process({
          req,
          res,
          api,
          config,
        });
      },
    ];
  };
}

function mountWebhooks(
  api: Shopify,
  config: AppConfigInterface,
  handlers: WebhookHandlersParam,
) {
  api.webhooks.addHandlers(handlers as AddHandlersParams);

  // Add our custom app uninstalled webhook
  const appInstallations = new AppInstallations(config);

  api.webhooks.addHandlers({
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: config.webhooks.path,
      callback: deleteAppInstallationHandler(appInstallations, config),
    },
  });
}
