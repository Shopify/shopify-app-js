import {Request, Response} from 'express';
import {Shopify} from '@shopify/shopify-api';

import {AppConfigInterface} from './config-types';

export interface ApiAndConfigParams {
  api: Shopify;
  config: AppConfigInterface;
}

export interface RedirectToAuthParams extends ApiAndConfigParams {
  req: Request;
  res: Response;
  isOnline?: boolean;
}

export interface ReturnTopLevelRedirectionParams {
  res: Response;
  config: AppConfigInterface;
  bearerPresent: boolean;
  redirectUrl: string;
}
