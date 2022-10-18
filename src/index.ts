import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ConfigParams as ApiConfigParams,
  SessionStorage,
  ShopifyRestResources,
  LATEST_API_VERSION,
  DeliveryMethod,
} from '@shopify/shopify-api';

import {AppConfigParams, ShopifyApp, AppConfigInterface} from './types';
import {AuthConfigInterface} from './auth/types';
import {HttpWebhookHandler, WebhooksConfigInterface} from './webhooks/types';
import {createAuthApp} from './auth/index';
import {
  createAuthenticatedRequest,
  createDeleteAppInstallationHandler,
  createEnsureInstalled,
} from './middlewares/index';
import {createWebhookApp} from './webhooks/index';
import {AppInstallations} from './app-installations';

export * from './types';

export function shopifyApp<
  R extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(config: AppConfigParams<R, S> = {}): ShopifyApp<R, S> {
  const {api: apiConfig, ...appConfig} = config;

  const api = shopifyApi<R, S>(apiConfigWithDefaults<R, S>(apiConfig ?? {}));
  const validatedConfig = validateAppConfig(appConfig);
  const appInstallations = new AppInstallations(api);
  const specialWebhookHandlers: HttpWebhookHandler[] = [
    {
      topic: 'APP_UNINSTALLED',
      deliveryMethod: DeliveryMethod.Http,
      handler: createDeleteAppInstallationHandler(appInstallations),
    },
  ];

  return {
    config: validatedConfig,
    api,
    auth: createAuthApp({api, config: validatedConfig}),
    authenticatedRequest: createAuthenticatedRequest({
      api,
      config: validatedConfig,
    }),
    ensureInstalled: createEnsureInstalled({
      api,
      config: validatedConfig,
      appInstallations,
    }),
    webhooks: createWebhookApp({
      api,
      config: validatedConfig,
      specialWebhookHandlers,
    }),
  };
}

function apiConfigWithDefaults<
  R extends ShopifyRestResources,
  S extends SessionStorage = SessionStorage,
>(apiConfig: Partial<ApiConfigParams<R, S>>): ApiConfigParams<R, S> {
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
  };
  /* eslint-enable no-process-env */
}

function validateAppConfig(
  config: Omit<AppConfigParams, 'api'>,
): AppConfigInterface {
  const auth: AuthConfigInterface = {
    path: '/auth',
    callbackPath: '/auth/callback',
    ...config.auth,
  };

  const webhooks: WebhooksConfigInterface = {
    path: '/webhooks',
    handlers: [],
    ...config.webhooks,
  };

  return {
    useOnlineTokens: false,
    exitIframePath: '/exitiframe',
    ...config,
    auth,
    webhooks,
  };
}
