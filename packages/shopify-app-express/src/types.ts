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

export interface RedirectOutOfAppParams {
  config: AppConfigInterface;
}

export interface RedirectOutOfAppInnerParams {
  req: Request;
  res: Response;
  redirectUri: string;
  shop: string;
}

export type RedirectOutOfAppFunction = (
  params: RedirectOutOfAppInnerParams,
) => void;
