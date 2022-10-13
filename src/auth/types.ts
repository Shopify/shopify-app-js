import express from 'express';
import {Shopify, Session} from '@shopify/shopify-api';

import {AppConfigInterface} from '../types';

export interface CreateAuthAppParams {
  api: Shopify;
  config: AppConfigInterface;
}

interface AfterAuthCallbackParams {
  req: express.Request;
  res: express.Response;
  session: Session;
}

export type AfterAuthCallback = (
  params: AfterAuthCallbackParams,
) => void | Promise<void>;

export interface AuthMiddlewareParams {
  afterAuth?: AfterAuthCallback;
}

export interface CreateAuthBeginParams {
  api: Shopify;
  config: AppConfigInterface;
}

export interface CreateAuthCallbackParams {
  api: Shopify;
  config: AppConfigInterface;
  afterAuth?: AfterAuthCallback;
}
