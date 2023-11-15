import {
  ConfigParams,
  LATEST_API_VERSION,
  LogSeverity,
  SESSION_COOKIE_NAME,
  Session,
  shopifyApi,
  ConfigInterface as ApiConfig,
} from '@shopify/shopify-api';

import {AppDistribution, shopifyApp} from '../../../../index';

import {
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  expectBeginAuthRedirect,
  getThrownResponse,
  setUpValidSession,
  testConfig,
} from '../../../../__test-helpers';
import {AuthCodeFlowStrategy} from '../auth-code-flow';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {AppConfig, AppConfigArg, AuthConfig} from '../../../../config-types';

const LOG_FN = jest.fn();
const VALID_API_CONFIG: ConfigParams = {
  apiKey: 'test-key',
  apiSecretKey: 'test-secret',
  scopes: ['test-scope'],
  apiVersion: LATEST_API_VERSION,
  hostName: 'my-app.com',
  isEmbeddedApp: true,
  logger: {log: LOG_FN, level: LogSeverity.Debug},
};

describe('AuthCodeFlowStrategy', () => {
  describe('handleRoutes', () => {
    it('handles routes', async () => {
      // GIVEN
      const configArgs = testConfig({
        ...VALID_API_CONFIG,
        appUrl: `https://${VALID_API_CONFIG.hostName}`,
      });
      const api = shopifyApi(VALID_API_CONFIG);
      const config = derivedShopifyAppConfig(configArgs, api.config, {
        path: '/initiate-auth',
      });
      const params = {api, config, logger: api.logger};

      const request = new Request(`${APP_URL}/initiate-auth?shop=${TEST_SHOP}`);
      const strategy = new AuthCodeFlowStrategy(params);

      // WHEN
      const response = await getThrownResponse(
        strategy.handleRoutes.bind(strategy),
        request,
      );

      // THEN
      expectBeginAuthRedirect(configArgs, response);
    });
  });
});

function derivedShopifyAppConfig<Storage extends SessionStorage>(
  appConfig: AppConfigArg,
  apiConfig: ApiConfig,
  authPaths: Partial<AuthConfig> = {},
): AppConfig<Storage> {
  const authPathPrefix = appConfig.authPathPrefix || '/auth';
  appConfig.distribution = appConfig.distribution ?? AppDistribution.AppStore;

  return {
    ...appConfig,
    ...apiConfig,
    canUseLoginForm: appConfig.distribution !== AppDistribution.ShopifyAdmin,
    useOnlineTokens: appConfig.useOnlineTokens ?? false,
    hooks: appConfig.hooks ?? {},
    sessionStorage: appConfig.sessionStorage as Storage,
    future: appConfig.future ?? {},
    auth: {
      path: authPathPrefix,
      callbackPath: `${authPathPrefix}/callback`,
      patchSessionTokenPath: `${authPathPrefix}/session-token`,
      exitIframePath: `${authPathPrefix}/exit-iframe`,
      loginPath: `${authPathPrefix}/login`,
      ...authPaths,
    },
  };
}
