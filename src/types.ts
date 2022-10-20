import {Request, Response} from 'express';
import {
  ConfigParams as ApiConfigParams,
  Session,
  SessionStorage,
  ShopifyRestResources,
  Shopify,
} from '@shopify/shopify-api';

import {AuthConfigInterface, AuthMiddleware} from './auth/types';
import {WebhooksConfigInterface, WebhooksMiddleware} from './webhooks/types';
import {
  AuthenticatedRequestMiddleware,
  CspHeadersMiddleware,
  EnsureInstalledMiddleware,
} from './middlewares/types';

export * from './auth/types';
export * from './middlewares/types';
export * from './webhooks/types';

export interface AppConfigParams<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
> {
  api?: Partial<ApiConfigParams<R, S>>;
  useOnlineTokens?: boolean;
  exitIframePath?: string;
  auth?: Partial<AuthConfigInterface>;
  webhooks?: Partial<WebhooksConfigInterface>;
}

export interface AppConfigInterface extends Omit<AppConfigParams, 'api'> {
  useOnlineTokens: boolean;
  exitIframePath: string;
  auth: AuthConfigInterface;
  webhooks: WebhooksConfigInterface;
}

export interface ApiAndConfigParams {
  api: Shopify;
  config: AppConfigInterface;
}

export interface ShopifyApp<
  R extends ShopifyRestResources = ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
> {
  config: AppConfigInterface;
  api: Shopify<R, S>;
  auth: AuthMiddleware;
  authenticatedRequest: AuthenticatedRequestMiddleware;
  cspHeaders: CspHeadersMiddleware;
  webhooks: WebhooksMiddleware;
  ensureInstalled: EnsureInstalledMiddleware;
}

export interface RedirectToAuthParams extends ApiAndConfigParams {
  req: Request;
  res: Response;
}

export interface RedirectToHostParams {
  req: Request;
  res: Response;
  api: Shopify;
  session: Session;
}

export interface ReturnTopLevelRedirectionParams {
  res: Response;
  bearerPresent: boolean;
  redirectUrl: string;
}
