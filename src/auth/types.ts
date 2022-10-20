import {Express, Request, Response} from 'express';
import {Shopify, Session} from '@shopify/shopify-api';

import {ApiAndConfigParams, AppConfigInterface} from '../types';

export interface AfterAuthCallbackParams {
  req: Request;
  res: Response;
  session: Session;
}
export type AfterAuthCallback = (
  params: AfterAuthCallbackParams,
) => void | Promise<void>;

export interface AttachAuthParams extends ApiAndConfigParams {
  subApp: Express;
  afterAuth?: AfterAuthCallback;
}

export interface AuthBeginParams {
  req: Request;
  res: Response;
  api: Shopify;
  config: AppConfigInterface;
}

export interface AuthCallbackParams {
  req: Request;
  res: Response;
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
