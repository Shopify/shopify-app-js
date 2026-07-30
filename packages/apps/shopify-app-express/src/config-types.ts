import {
  ApiVersion,
  ConfigParams as ApiConfigParams,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {IdempotentPromiseHandler} from './helpers/idempotent-promise-handler';

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

  /**
   * When enabled, embedded apps fetch access tokens via token exchange instead of the OAuth redirect flow. Requires
   * Shopify managed installation. Non-embedded apps continue to use the OAuth code flow.
   *
   * @default false
   */
  unstable_tokenExchange?: boolean;
}

export interface HooksConfigInterface {
  /**
   * Called after authentication completes (both token exchange and OAuth), with the resulting session.
   */
  afterAuth?: (options: {session: Session}) => void | Promise<void>;
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
  hooks?: HooksConfigInterface;
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
  hooks: HooksConfigInterface;
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
