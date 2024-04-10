import semver from 'semver';
import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ConfigParams as ApiConfigParams,
  LATEST_API_VERSION,
  Shopify,
  FeatureDeprecatedError,
} from '@shopify/shopify-api';
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
import {redirectOutOfApp} from './redirect-out-of-app';
import {RedirectOutOfAppFunction} from './types';

export * from './types';
export * from './auth/types';
export * from './middlewares/types';
export * from './webhooks/types';
export type {AppConfigParams} from './config-types';

type DefaultedConfigs<Params extends Partial<ApiConfigParams> | undefined> =
  ApiConfigParams & Params;

type ConfigInterfaceFromParams<Params extends AppConfigParams> =
  AppConfigInterface<
    NonNullable<DefaultedConfigs<Params['api']>['restResources']>,
    Params['sessionStorage'] extends undefined
      ? MemorySessionStorage
      : NonNullable<Params['sessionStorage']>
  >;

export interface ShopifyApp<Params extends AppConfigParams = AppConfigParams> {
  config: ConfigInterfaceFromParams<Params>;
  api: Shopify<DefaultedConfigs<Params['api']>>;
  auth: AuthMiddleware;
  processWebhooks: ProcessWebhooksMiddleware;
  validateAuthenticatedSession: ValidateAuthenticatedSessionMiddleware;
  cspHeaders: CspHeadersMiddleware;
  ensureInstalledOnShop: EnsureInstalledMiddleware;
  redirectToShopifyOrAppRoot: RedirectToShopifyOrAppRootMiddleware;
  redirectOutOfApp: RedirectOutOfAppFunction;
}

export function shopifyApp<Params extends AppConfigParams>(
  config: Params,
): ShopifyApp<Params> {
  const {api: apiConfig, ...appConfig} = config;

  const api = shopifyApi(apiConfigWithDefaults(apiConfig ?? {}));
  const validatedConfig = validateAppConfig(appConfig, api);

  return {
    config: validatedConfig,
    api: api as Shopify<DefaultedConfigs<Params['api']>>,
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
    redirectOutOfApp: redirectOutOfApp({api, config: validatedConfig}),
  };
}

function apiConfigWithDefaults<Params extends Partial<ApiConfigParams>>(
  apiConfig: Params,
): DefaultedConfigs<Params> {
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

function validateAppConfig<Params extends Omit<AppConfigParams, 'api'>>(
  config: Params,
  api: Shopify,
): ConfigInterfaceFromParams<Params> {
  const {sessionStorage, ...configWithoutSessionStorage} = config;

  return {
    // We override the API package's logger to add the right package context by default (and make the call simpler)
    logger: overrideLoggerPackage(api.logger),
    useOnlineTokens: false,
    exitIframePath: '/exitiframe',
    sessionStorage: (sessionStorage ??
      new MemorySessionStorage()) as ConfigInterfaceFromParams<Params>['sessionStorage'],
    ...configWithoutSessionStorage,
    auth: config.auth,
    webhooks: config.webhooks,
  };
}

function overrideLoggerPackage(logger: Shopify['logger']): Shopify['logger'] {
  const baseContext = {package: 'shopify-app'};

  const warningFunction: Shopify['logger']['warning'] = (
    message,
    context = {},
  ) => logger.warning(message, {...baseContext, ...context});

  return {
    ...logger,
    log: (severity, message, context = {}) =>
      logger.log(severity, message, {...baseContext, ...context}),
    debug: (message, context = {}) =>
      logger.debug(message, {...baseContext, ...context}),
    info: (message, context = {}) =>
      logger.info(message, {...baseContext, ...context}),
    warning: warningFunction,
    error: (message, context = {}) =>
      logger.error(message, {...baseContext, ...context}),
    deprecated: deprecated(warningFunction),
  };
}

function deprecated(warningFunction: Shopify['logger']['warning']) {
  return function (version: string, message: string): Promise<void> {
    if (semver.gte(SHOPIFY_EXPRESS_LIBRARY_VERSION, version)) {
      throw new FeatureDeprecatedError(
        `Feature was deprecated in version ${version}`,
      );
    }

    return warningFunction(`[Deprecated | ${version}] ${message}`);
  };
}
