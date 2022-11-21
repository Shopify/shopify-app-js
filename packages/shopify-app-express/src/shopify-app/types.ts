import {Express} from 'express';

import {AfterAuthCallback} from '../types';
import {WebhookHandlersParam} from '../webhooks/types';

export interface AppMiddlewareParams {
  afterAuth?: AfterAuthCallback;
  webhookHandlers?: WebhookHandlersParam;
}

export type AppMiddleware = (params?: AppMiddlewareParams) => Express;
