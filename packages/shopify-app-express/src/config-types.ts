import {
  ConfigParams as ApiConfigParams,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

export interface AppConfigParams<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Storage extends SessionStorage = SessionStorage,
> {
  auth: AuthConfigInterface;
  webhooks: WebhooksConfigInterface;
  api?: Partial<ApiConfigParams<Resources>>;
  useOnlineTokens?: boolean;
  exitIframePath?: string;
  sessionStorage?: Storage;
}

export interface AppConfigInterface<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Storage extends SessionStorage = SessionStorage,
> extends Omit<AppConfigParams<Resources, Storage>, 'api'> {
  logger: Shopify['logger'];
  useOnlineTokens: boolean;
  exitIframePath: string;
  sessionStorage: Storage;
}

export interface AuthConfigInterface {
  path: string;
  callbackPath: string;
  checkBillingPlans?: string[];
}

export interface WebhooksConfigInterface {
  path: string;
}
