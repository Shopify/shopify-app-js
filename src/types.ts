import {
  ConfigParams as ApiConfigParams,
  SessionStorage,
  ShopifyRestResources,
  Shopify,
  ApiVersion,
} from '@shopify/shopify-api';

export interface ShopifyApp<
  T extends ShopifyRestResources = ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
> {
  api: Shopify<T, S>;
}

export type ApiConfigParamsWithoutDefaults<
  T extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
> = Omit<ApiConfigParams<T, S>, 'isEmbeddedApp' | 'apiVersion'> & {
  isEmbeddedApp?: boolean;
  apiVersion?: ApiVersion;
};

export interface AppConfigParams<
  T extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
> {
  api: ApiConfigParamsWithoutDefaults<T, S>;
}
