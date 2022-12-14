import {
  ConfigParams as ApiConfigParams,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

export interface AppConfigParams<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
> {
  auth: AuthConfigInterface;
  webhooks: WebhooksConfigInterface;
  api?: Partial<ApiConfigParams<R>>;
  useOnlineTokens?: boolean;
  exitIframePath?: string;
  sessionStorage?: S;
}

export interface AppConfigInterface<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
> extends Omit<AppConfigParams<R, S>, 'api'> {
  logger: Shopify['logger'];
  useOnlineTokens: boolean;
  exitIframePath: string;
  sessionStorage: S;
}

export interface AuthConfigInterface {
  path: string;
  callbackPath: string;
  checkBillingPlans?: string[];
}

export interface WebhooksConfigInterface {
  path: string;
}
