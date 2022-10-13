import express, {Request, Response} from 'express';

import {CreateWebhookAppParams, WebhooksMiddleware} from './types';
import {process} from './process';
import {addWebhookHandlers} from './add-webhook-handlers';

export function createWebhookApp({
  api,
  config,
}: CreateWebhookAppParams): WebhooksMiddleware {
  return function webhookApp(webhooksParams = {}) {
    config.webhooks.handlers = webhooksParams.handlers || [];

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
