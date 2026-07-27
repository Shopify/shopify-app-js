import {
  ApiVersion,
  ConfigParams as ApiConfigParams,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

// Make apiVersion required while keeping other API config fields optional
export type ExpressApiConfigParams<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = Partial<ApiConfigParams<Resources>> & {
  apiVersion: ApiVersion;
};

export interface FutureFlags {
  /**
   * When enabled, the app will use expiring offline access tokens and automatically refresh them when they are close to
   * expiring.
   *
   * @default false
   */
  expiringOfflineAccessTokens?: boolean;
}

export interface AppConfigParams<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Storage extends SessionStorage = SessionStorage,
> {
  auth: AuthConfigInterface;
  webhooks: WebhooksConfigInterface;
  api: ExpressApiConfigParams<Resources>;
  useOnlineTokens?: boolean;
  exitIframePath?: string;
  sessionStorage?: Storage;
  future?: FutureFlags;
}

export interface AppConfigInterface<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Storage extends SessionStorage = SessionStorage,
> extends Omit<AppConfigParams<Resources, Storage>, 'api'> {
  logger: Shopify['logger'];
  useOnlineTokens: boolean;
  exitIframePath: string;
  sessionStorage: Storage;
  future: FutureFlags;
}

export interface AuthConfigInterface {
  path: string;
  callbackPath: string;
  checkBillingPlans?: string[];
}

export interface WebhooksConfigInterface {
  path: string;
}
