import express from 'express';

import {attachWebhooks, webhooksMount} from '../webhooks/index';
import {ApiAndConfigParams} from '../types';

import {AppMiddleware} from './types';

export function createShopifyApp({
  api,
  config,
}: ApiAndConfigParams): AppMiddleware {
  return function subApp(params = {}) {
    const subApp = express();

    subApp.on('mount', () => {
      const mountPath = subApp.mountpath as string;

      config.webhooks.path = `${mountPath}${config.webhooks.path}`;

      webhooksMount({
        api,
        config,
        handlers: params.webhookHandlers || {},
      });
    });

    attachWebhooks({api, config, subApp});

    return subApp;
  };
}
