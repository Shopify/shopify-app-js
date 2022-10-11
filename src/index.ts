import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ConfigParams as ApiConfigParams,
  SessionStorage,
  ShopifyRestResources,
  LATEST_API_VERSION,
} from '@shopify/shopify-api';

import {
  AppConfigParams,
  ApiConfigParamsWithoutDefaults,
  ShopifyApp,
} from './types';

export * from './types';

export function shopifyApp<
  T extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(config: AppConfigParams<T, S>): ShopifyApp<T, S> {
  const api = shopifyApi<T, S>(apiConfigWithDefaults<T, S>(config.api));

  return {api};
}

function apiConfigWithDefaults<
  T extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(apiConfig: ApiConfigParamsWithoutDefaults<T, S>): ApiConfigParams<T, S> {
  return {isEmbeddedApp: true, apiVersion: LATEST_API_VERSION, ...apiConfig};
}
