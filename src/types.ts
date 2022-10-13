import express, {Express, Request, Response, NextFunction} from 'express';
import {
  ConfigParams as ApiConfigParams,
  Session,
  SessionStorage,
  ShopifyRestResources,
  Shopify,
} from '@shopify/shopify-api';

import {AuthMiddlewareParams} from './auth/types';

export * from './auth/types';

export interface AuthConfigInterface {
  path: string;
  callbackPath: string;
  checkBillingPlans?: string[];
}

export interface AppConfigParams<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
> {
  api?: Partial<ApiConfigParams<R, S>>;
  useOnlineTokens?: boolean;
  exitIframePath?: string;
  auth?: Partial<AuthConfigInterface>;
}

export interface AppConfigInterface extends Omit<AppConfigParams, 'api'> {
  useOnlineTokens: boolean;
  exitIframePath: string;
  auth: AuthConfigInterface;
}

export interface ShopifyApp<
  R extends ShopifyRestResources = ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
> {
  config: AppConfigInterface;
  api: Shopify<R, S>;
  auth: (authParams?: AuthMiddlewareParams) => Express;
  authenticatedRequest: () => (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
}

export interface RedirectToAuthParams {
  req: Request;
  res: Response;
  api: Shopify;
  config: AppConfigInterface;
}

export interface RedirectToHostParams {
  req: Request;
  res: Response;
  api: Shopify;
  session: Session;
}
