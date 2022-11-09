import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ConfigParams as ApiConfigParams,
  ShopifyRestResources,
  LATEST_API_VERSION,
} from '@shopify/shopify-api';

import {MemorySessionStorage} from '../session-storage/memory';
import {SessionStorage} from '../session-storage/session-storage';

import {SHOPIFY_EXPRESS_LIBRARY_VERSION} from './version';
import {AppConfigParams, ShopifyApp, AppConfigInterface} from './types';
import {AuthConfigInterface} from './auth/types';
import {WebhooksConfigInterface} from './webhooks/types';
import {
  createAuthenticatedRequest,
  createCspHeaders,
  createEnsureInstalled,
} from './middlewares/index';
import {createSubApp} from './sub-app/index';

export * from './types';

export function shopifyApp<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
>(config: AppConfigParams<R, S> = {}): ShopifyApp<R, S> {
  const {api: apiConfig, ...appConfig} = config;

  const api = shopifyApi<R>(apiConfigWithDefaults<R>(apiConfig ?? {}));
  const validatedConfig = validateAppConfig<R, S>(appConfig);

  return {
    config: validatedConfig,
    api,
    app: createSubApp({api, config: validatedConfig}),
    authenticatedRequest: createAuthenticatedRequest({
      api,
      config: validatedConfig,
    }),
    cspHeaders: createCspHeaders({api}),
    ensureInstalled: createEnsureInstalled({
      api,
      config: validatedConfig,
    }),
  };
}

function apiConfigWithDefaults<R extends ShopifyRestResources>(
  apiConfig: Partial<ApiConfigParams<R>>,
): ApiConfigParams<R> {
  let userAgent = `Shopify Express Library v${SHOPIFY_EXPRESS_LIBRARY_VERSION}`;

  if (apiConfig.userAgentPrefix) {
    userAgent = `${apiConfig.userAgentPrefix} | ${userAgent}`;
  }

  /* eslint-disable no-process-env */
  return {
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
    userAgentPrefix: userAgent,
  };
  /* eslint-enable no-process-env */
}

function validateAppConfig<
  R extends ShopifyRestResources,
  S extends SessionStorage,
>(config: Omit<AppConfigParams<R, S>, 'api'>): AppConfigInterface<S> {
  const {sessionStorage, ...configWithoutSessionStorage} = config;

  const auth: AuthConfigInterface = {
    path: '/auth',
    callbackPath: '/auth/callback',
    ...config.auth,
  };

  const webhooks: WebhooksConfigInterface = {
    path: '/webhooks',
    ...config.webhooks,
  };

  return {
    useOnlineTokens: false,
    exitIframePath: '/exitiframe',
    sessionStorage: sessionStorage ?? new MemorySessionStorage(),
    ...configWithoutSessionStorage,
    auth,
    webhooks,
  };
}
