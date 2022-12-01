import {Express, Request, Response} from 'express';
import {Shopify} from '@shopify/shopify-api';

import {AfterAuthCallback, AppConfigInterface} from '../config-types';
import {ApiAndConfigParams} from '../types';

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
