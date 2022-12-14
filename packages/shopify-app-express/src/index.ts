import semver from 'semver';
import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ConfigParams as ApiConfigParams,
  ShopifyRestResources,
  LATEST_API_VERSION,
  Shopify,
  FeatureDeprecatedError,
} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {SHOPIFY_EXPRESS_LIBRARY_VERSION} from './version';
import {AppConfigInterface, AppConfigParams} from './config-types';
import {
  validateAuthenticatedSession,
  cspHeaders,
  ensureInstalled,
  redirectToShopifyOrAppRoot,
} from './middlewares/index';
import {AuthMiddleware} from './auth/types';
import {auth} from './auth/index';
import {ProcessWebhooksMiddleware} from './webhooks/types';
import {processWebhooks} from './webhooks/index';
import {
  ValidateAuthenticatedSessionMiddleware,
  CspHeadersMiddleware,
  EnsureInstalledMiddleware,
  RedirectToShopifyOrAppRootMiddleware,
} from './middlewares/types';

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
  auth: AuthMiddleware;
  processWebhooks: ProcessWebhooksMiddleware;
  validateAuthenticatedSession: ValidateAuthenticatedSessionMiddleware;
  cspHeaders: CspHeadersMiddleware;
  ensureInstalledOnShop: EnsureInstalledMiddleware;
  redirectToShopifyOrAppRoot: RedirectToShopifyOrAppRootMiddleware;
}

export function shopifyApp<
  R extends ShopifyRestResources = any,
  S extends SessionStorage = SessionStorage,
>(config: AppConfigParams<R, S>): ShopifyApp<R, S> {
  const {api: apiConfig, ...appConfig} = config;

  const api = shopifyApi<R>(apiConfigWithDefaults<R>(apiConfig ?? {}));
  const validatedConfig = validateAppConfig<R, S>(appConfig, api);

  return {
    config: validatedConfig,
    api,
    auth: auth({api, config: validatedConfig}),
    processWebhooks: processWebhooks({api, config: validatedConfig}),
    validateAuthenticatedSession: validateAuthenticatedSession({
      api,
      config: validatedConfig,
    }),
    cspHeaders: cspHeaders({api}),
    ensureInstalledOnShop: ensureInstalled({
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

  return {
    // We override the API package's logger to add the right package context by default (and make the call simpler)
    logger: overrideLoggerPackage(api.logger),
    useOnlineTokens: false,
    exitIframePath: '/exitiframe',
    sessionStorage: sessionStorage ?? new MemorySessionStorage(),
    ...configWithoutSessionStorage,
    auth: config.auth,
    webhooks: config.webhooks,
  };
}

function overrideLoggerPackage(logger: Shopify['logger']): Shopify['logger'] {
  const baseContext = {package: 'shopify-app'};

  const warningFunction: Shopify['logger']['warning'] = async (
    message,
    context = {},
  ) => logger.warning(message, {...baseContext, ...context});

  return {
    ...logger,
    log: async (severity, message, context = {}) =>
      logger.log(severity, message, {...baseContext, ...context}),
    debug: async (message, context = {}) =>
      logger.debug(message, {...baseContext, ...context}),
    info: async (message, context = {}) =>
      logger.info(message, {...baseContext, ...context}),
    warning: warningFunction,
    error: async (message, context = {}) =>
      logger.error(message, {...baseContext, ...context}),
    deprecated: deprecated(warningFunction),
  };
}

function deprecated(warningFunction: Shopify['logger']['warning']) {
  return async function (version: string, message: string): Promise<void> {
    if (semver.gte(SHOPIFY_EXPRESS_LIBRARY_VERSION, version)) {
      throw new FeatureDeprecatedError(
        `Feature was deprecated in version ${version}`,
      );
    }

    return warningFunction(`[Deprecated | ${version}] ${message}`);
  };
}
