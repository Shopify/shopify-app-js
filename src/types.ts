import express, {Express} from 'express';
import {
  ConfigParams as ApiConfigParams,
  SessionStorage,
  ShopifyRestResources,
  Shopify,
  Session,
} from '@shopify/shopify-api';

export * from './auth/types';

interface AfterAuthCallbackParams {
  req: express.Request;
  res: express.Response;
  session: Session;
  api: Shopify;
}
type AfterAuthCallback = (
  params: AfterAuthCallbackParams,
) => void | Promise<void>;

export interface AuthConfigInterface {
  path: string;
  callbackPath: string;
  afterAuth?: AfterAuthCallback;
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
  auth: Express;
}
