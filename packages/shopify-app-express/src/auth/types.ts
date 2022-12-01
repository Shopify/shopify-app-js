import {Shopify} from '@shopify/shopify-api';
import {Request, RequestHandler, Response} from 'express';

import {AppConfigInterface} from '../config-types';
import {ApiAndConfigParams} from '../types';

export interface AuthMiddleware {
  begin: () => RequestHandler;
  callback: () => RequestHandler;
}

export interface AuthCallbackParams extends ApiAndConfigParams {
  req: Request;
  res: Response;
  api: Shopify;
  config: AppConfigInterface;
}
