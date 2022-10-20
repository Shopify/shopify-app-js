import {Express} from 'express';

import {AfterAuthCallback, WebhookConfigHandler} from '../types';

export interface AppMiddlewareParams {
  afterAuth?: AfterAuthCallback;
  webhookHandlers?: WebhookConfigHandler[];
}

export type AppMiddleware = (params?: AppMiddlewareParams) => Express;
