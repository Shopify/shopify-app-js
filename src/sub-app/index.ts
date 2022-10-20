import express from 'express';

import {attachAuth} from '../auth/index';
import {attachWebhooks} from '../webhooks/index';
import {ApiAndConfigParams} from '../types';

import {AppMiddleware} from './types';

export function createSubApp({api, config}: ApiAndConfigParams): AppMiddleware {
  return function subApp(params = {}) {
    const subApp = express();

    subApp.on('mount', () => {
      const mountPath = subApp.mountpath as string;

      config.auth.path = `${mountPath}${config.auth.path}`;
      config.auth.callbackPath = `${mountPath}${config.auth.callbackPath}`;
      config.webhooks.path = `${mountPath}${config.webhooks.path}`;
    });

    attachAuth({
      api,
      config,
      subApp,
      afterAuth: params.afterAuth,
    });

    attachWebhooks({
      api,
      config,
      subApp,
      handlers: params.webhookHandlers || [],
    });

    return subApp;
  };
}
