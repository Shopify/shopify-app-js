import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ConfigParams as ApiConfigParams,
  ShopifyRestResources,
  LATEST_API_VERSION,
  Shopify,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {SHOPIFY_EXPRESS_LIBRARY_VERSION} from './version';
import {
  AppConfigInterface,
  AppConfigParams,
  AuthConfigInterface,
  WebhooksConfigInterface,
} from './config-types';
import {
  createValidateAuthenticatedSession,
  createCspHeaders,
  createEnsureInstalled,
  redirectToShopifyOrAppRoot,
} from './middlewares/index';
import {createShopifyApp} from './shopify-app/index';
import {AuthMiddleware} from './auth/types';
import {auth} from './auth/index';
import {
  ValidateAuthenticatedSessionMiddleware,
  CspHeadersMiddleware,
  EnsureInstalledMiddleware,
  RedirectToShopifyOrAppRootMiddleware,
} from './middlewares/types';
import {AppMiddleware} from './shopify-app/types';

export * from './types';
export * from './auth/types';
export * from './middlewares/types';
export * from './webhooks/types';

export interface ShopifyApp<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
> {
  config: AppConfigInterface<S>;
  api: Shopify<R>;
  app: AppMiddleware;
  auth: AuthMiddleware;
  validateAuthenticatedSession: ValidateAuthenticatedSessionMiddleware;
  cspHeaders: CspHeadersMiddleware;
  ensureInstalledOnShop: EnsureInstalledMiddleware;
  redirectToShopifyOrAppRoot: RedirectToShopifyOrAppRootMiddleware;
}

export function shopifyApp<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
>(config: AppConfigParams<R, S> = {}): ShopifyApp<R, S> {
  const {api: apiConfig, ...appConfig} = config;

  const api = shopifyApi<R>(apiConfigWithDefaults<R>(apiConfig ?? {}));
  const validatedConfig = validateAppConfig<R, S>(appConfig, api);

  return {
    config: validatedConfig,
    api,
    app: createShopifyApp({api, config: validatedConfig}),
    auth: auth({api, config: validatedConfig}),
    validateAuthenticatedSession: createValidateAuthenticatedSession({
      api,
      config: validatedConfig,
    }),
    cspHeaders: createCspHeaders({api}),
    ensureInstalledOnShop: createEnsureInstalled({
      api,
      config: validatedConfig,
    }),
    redirectToShopifyOrAppRoot: redirectToShopifyOrAppRoot({
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
>(
  config: Omit<AppConfigParams<R, S>, 'api'>,
  api: Shopify,
): AppConfigInterface<S> {
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
    // We override the API package's logger to add the right package context by default (and make the call simpler)
    logger: overrideLoggerPackage(api.logger),
    useOnlineTokens: false,
    exitIframePath: '/exitiframe',
    sessionStorage: sessionStorage ?? new MemorySessionStorage(),
    ...configWithoutSessionStorage,
    auth,
    webhooks,
  };
}

function overrideLoggerPackage(logger: Shopify['logger']): Shopify['logger'] {
  const baseContext = {package: 'shopify-app'};

  return {
    log: async (severity, message, context = {}) =>
      logger.log(severity, message, {...baseContext, ...context}),
    debug: async (message, context = {}) =>
      logger.debug(message, {...baseContext, ...context}),
    info: async (message, context = {}) =>
      logger.info(message, {...baseContext, ...context}),
    warning: async (message, context = {}) =>
      logger.warning(message, {...baseContext, ...context}),
    error: async (message, context = {}) =>
      logger.error(message, {...baseContext, ...context}),
  };
}
