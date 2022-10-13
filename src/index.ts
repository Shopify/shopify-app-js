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
  R extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(config: AppConfigParams<R, S> = {}): ShopifyApp<R, S> {
  const {api: apiConfig, ...appConfig} = config;

  const api = shopifyApi<R, S>(apiConfigWithDefaults<R, S>(apiConfig ?? {}));
  const validatedConfig = validateAppConfig(appConfig);

  return {
    config: validatedConfig,
    api,
    auth: createAuthApp({api, config: validatedConfig}),
  };
}

function apiConfigWithDefaults<
  R extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(apiConfig: Partial<ApiConfigParams<R, S>>): ApiConfigParams<R, S> {
  /* eslint-disable no-process-env */
  const config: Partial<ApiConfigParams<R, S>> = {
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

  return config as ApiConfigParams<R, S>;
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
