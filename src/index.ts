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
  ShopifyApp,
  AppConfigInterface,
  AuthConfigInterface,
} from './types';
import {createAuthApp} from './auth/index';

export * from './types';

export function shopifyApp<
  T extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(config: AppConfigParams<T, S>): ShopifyApp<T, S> {
  const {api: apiConfig, ...appConfig} = config;

  const api = shopifyApi<T, S>(apiConfigWithDefaults<T, S>(apiConfig ?? {}));
  const validatedConfig = validateAppConfig(appConfig);

  return {
    config: validatedConfig,
    api,
    auth: createAuthApp({api, config: validatedConfig}),
  };
}

function apiConfigWithDefaults<
  T extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(apiConfig: Partial<ApiConfigParams<T, S>>): ApiConfigParams<T, S> {
  /* eslint-disable no-process-env */
  const config: Partial<ApiConfigParams<T, S>> = {
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    scopes: process.env.SCOPES?.split(',')!,
    hostScheme: (process.env.HOST?.split('://')[0] as 'http' | 'https')!,
    hostName: process.env.HOST?.replace(/https?:\/\//, '')!,
    isEmbeddedApp: true,
    apiVersion: LATEST_API_VERSION,
    ...(process.env.SHOP_CUSTOM_DOMAIN && {
      customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN],
    }),
    ...apiConfig,
  };
  /* eslint-enable no-process-env */

  return config as ApiConfigParams<T, S>;
}

function validateAppConfig(
  config: Omit<AppConfigParams, 'api'>,
): AppConfigInterface {
  const auth: AuthConfigInterface = {
    path: '/auth',
    callbackPath: '/auth/callback',
    ...config.auth,
  };

  return {
    useOnlineTokens: false,
    exitIframePath: '/exitiframe',
    ...config,
    auth,
  };
}
