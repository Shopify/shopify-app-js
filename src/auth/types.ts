import express, {Express} from 'express';
import {Shopify, Session} from '@shopify/shopify-api';

import {AppConfigInterface} from '../types';

export interface CreateAuthAppParams {
  api: Shopify;
  config: AppConfigInterface;
}

export interface AfterAuthCallbackParams {
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

export type AuthMiddleware = (authParams?: AuthMiddlewareParams) => Express;

export interface AuthBeginParams {
  req: express.Request;
  res: express.Response;
  api: Shopify;
  config: AppConfigInterface;
}

export interface AuthCallbackParams {
  req: express.Request;
  res: express.Response;
  api: Shopify;
  config: AppConfigInterface;
  afterAuth?: AfterAuthCallback;
}

export interface AuthConfigInterface {
  path: string;
  callbackPath: string;
  afterAuth?: AfterAuthCallback;
  checkBillingPlans?: string[];
}
