import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ConfigParams as ApiConfigParams,
} from '@shopify/shopify-api';

import {
  AppConfigParams,
  ApiConfigParamsWithoutDefaults,
  ShopifyApp,
} from './types';

export * from './types';

export function shopifyApp(config: AppConfigParams): ShopifyApp {
  const shopify = shopifyApi(apiConfigWithDefaults(config.api));

  return {api: shopify};
}

function apiConfigWithDefaults(
  apiConfig: ApiConfigParamsWithoutDefaults,
): ApiConfigParams {
  return {isEmbeddedApp: true, ...apiConfig};
}
