import {Express} from 'express';

import {WebhookHandlersParam} from '../webhooks/types';

export interface AppMiddlewareParams {
  webhookHandlers?: WebhookHandlersParam;
}

export type AppMiddleware = (params?: AppMiddlewareParams) => Express;
