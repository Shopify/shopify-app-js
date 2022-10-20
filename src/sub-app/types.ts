import {Express} from 'express';

import {AfterAuthCallback, WebhookConfigHandler} from '../types';

export interface AppMiddlewareParams {
  afterAuth?: AfterAuthCallback;
  handlers?: WebhookConfigHandler[];
}

export type AppMiddleware = (params?: AppMiddlewareParams) => Express;
