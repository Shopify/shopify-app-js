import {
  ApiVersion,
  ConfigParams as ApiConfigParams,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {FutureFlags, FutureFlagOptions} from './future/flags';
import {IdempotentPromiseHandler} from './helpers/idempotent-promise-handler';

// Make apiVersion required while keeping other API config fields optional
export type ExpressApiConfigParams<
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = Partial<ApiConfigParams<Resources>> & {
  apiVersion: ApiVersion;
};

export interface AppConfigParams<
  Resources extends ShopifyRestResources = ShopifyRestResources,
  Storage extends SessionStorage = SessionStorage,
  Future extends FutureFlagOptions = FutureFlagOptions,
> {
  auth: AuthConfigInterface;
  webhooks: WebhooksConfigInterface;
  api: ExpressApiConfigParams<Resources>;
  useOnlineTokens?: boolean;
  exitIframePath?: string;
  sessionStorage?: Storage;
  future?: Future;
  hooks?: {
    afterAuth?: (options: {session: Session}) => void | Promise<void>;
  };
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
  hooks: {
    afterAuth?: (options: {session: Session}) => void | Promise<void>;
  };
  idempotentPromiseHandler: IdempotentPromiseHandler;
}

export interface AuthConfigInterface {
  path: string;
  callbackPath: string;
  checkBillingPlans?: string[];
}

export interface WebhooksConfigInterface {
  path: string;
}
