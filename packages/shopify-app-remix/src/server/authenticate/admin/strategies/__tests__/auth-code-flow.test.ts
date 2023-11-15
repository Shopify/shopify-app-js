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
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  TestConfig,
  expectBeginAuthRedirect,
  expectExitIframeRedirect,
  getThrownResponse,
  mockExternalRequest,
  setUpValidSession,
  signRequestCookie,
  testConfig,
} from '../../../../__test-helpers';
import {AuthCodeFlowStrategy} from '../auth-code-flow';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {AppConfig, AppConfigArg, AuthConfig} from '../../../../config-types';
import {BasicParams} from '../../../../types';
import {HashFormat, createSHA256HMAC} from '@shopify/shopify-api/runtime';

const LOG_FN = jest.fn();
const VALID_API_CONFIG: ConfigParams = {
  apiKey: API_KEY,
  apiSecretKey: API_SECRET_KEY,
  scopes: ['test-scope'],
  apiVersion: LATEST_API_VERSION,
  hostName: 'my-app.com',
  isEmbeddedApp: true,
  logger: {log: LOG_FN, level: LogSeverity.Debug},
};

describe('AuthCodeFlowStrategy', () => {
  describe('handleRoutes', () => {
    describe('when request path matches auth path', () => {
      it('initiates auth code flow when embedded without iframe header', async () => {
        // GIVEN
        const {params, config} = getBasicParamsAndConfig({
          appConfig: {appUrl: `https://${VALID_API_CONFIG.hostName}`},
          authPaths: {
            path: '/initiate-auth',
          },
        });
        const request = new Request(
          `${APP_URL}/initiate-auth?shop=${TEST_SHOP}`,
        );
        const strategy = new AuthCodeFlowStrategy(params);

        // WHEN
        const response = await getThrownResponse(
          strategy.handleRoutes.bind(strategy),
          request,
        );

        // THEN
        expectBeginAuthRedirect(config, response);
      });

      it('initiates auth code flow when not embedded', async () => {
        // GIVEN
        const {params, config} = getBasicParamsAndConfig({
          appConfig: {
            appUrl: `https://${VALID_API_CONFIG.hostName}`,
            isEmbeddedApp: false,
          },
          authPaths: {
            path: '/initiate-auth',
          },
        });
        const request = new Request(
          `${APP_URL}/initiate-auth?shop=${TEST_SHOP}`,
        );
        const strategy = new AuthCodeFlowStrategy(params);

        // WHEN
        const response = await getThrownResponse(
          strategy.handleRoutes.bind(strategy),
          request,
        );

        // THEN
        expectBeginAuthRedirect(config, response);
      });

      it('initiates auth code flow when embedded with iframe header', async () => {
        // GIVEN
        const {params, config} = getBasicParamsAndConfig({
          appConfig: {appUrl: `https://${VALID_API_CONFIG.hostName}`},
          authPaths: {
            path: '/initiate-auth',
          },
        });
        const request = new Request(
          `${APP_URL}/initiate-auth?shop=${TEST_SHOP}`,
          {headers: {'Sec-Fetch-Dest': 'iframe'}},
        );
        const strategy = new AuthCodeFlowStrategy(params);

        // WHEN
        const response = await getThrownResponse(
          strategy.handleRoutes.bind(strategy),
          request,
        );

        // THEN
        expectExitIframeRedirect(response, {
          host: null,
          destination: `/initiate-auth?shop=${TEST_SHOP}`,
        });
      });

      it('returns 400 when shop is invalid', async () => {
        // GIVEN
        const {params, config} = getBasicParamsAndConfig({
          appConfig: {appUrl: `https://${VALID_API_CONFIG.hostName}`},
          authPaths: {
            path: '/initiate-auth',
          },
        });
        const request = new Request(`${APP_URL}/initiate-auth?shop=google.com`);
        const strategy = new AuthCodeFlowStrategy(params);

        // WHEN
        const response = await getThrownResponse(
          strategy.handleRoutes.bind(strategy),
          request,
        );

        // THEN
        expect(response.status).toBe(400);
        expect(await response.text()).toBe('Shop param is invalid');
      });
    });

    describe('when request path matches auth callback path', () => {
      it('fetches access token and stores it', async () => {
        // GIVEN
        const {params, config} = getBasicParamsAndConfig({
          appConfig: {appUrl: `https://${VALID_API_CONFIG.hostName}`},
          authPaths: {
            callbackPath: '/auth/callback',
          },
        });

        const strategy = new AuthCodeFlowStrategy(params);

        // WHEN
        await mockCodeExchangeRequest('offline');
        const response = await getThrownResponse(
          strategy.handleRoutes.bind(strategy),
          await getValidCallbackRequest(config),
        );

        // THEN
        const [session] = await config.sessionStorage!.findSessionsByShop(
          TEST_SHOP,
        );

        expect(session).toMatchObject({
          accessToken: '123abc',
          id: `offline_${TEST_SHOP}`,
          isOnline: false,
          scope: 'read_products',
          shop: TEST_SHOP,
          state: 'nonce',
        });
      });
    });

    describe('when request path does not match any auth paths', () => {
      it('does not redirect or throw', async () => {
        // GIVEN
        const {params, config} = getBasicParamsAndConfig({
          appConfig: {appUrl: `https://${VALID_API_CONFIG.hostName}`},
          authPaths: {
            path: '/initiate-auth',
          },
        });
        const request = new Request(`${APP_URL}/my-path?shop=${TEST_SHOP}`);
        const strategy = new AuthCodeFlowStrategy(params);

        // WHEN
        const result = strategy.handleRoutes(request);

        // THEN
        await expect(result).resolves.toBeUndefined();
      });
    });
  });
});

function getBasicParamsAndConfig({
  appConfig = {},
  authPaths = {},
}: {
  appConfig: Partial<AppConfigArg>;
  authPaths: Partial<AuthConfig>;
}): {params: BasicParams; config: TestConfig<Partial<AppConfigArg>>} {
  const configArgs = testConfig({
    ...VALID_API_CONFIG,
    ...appConfig,
  });
  const api = shopifyApi(VALID_API_CONFIG);
  const config = derivedShopifyAppConfig(configArgs, api.config, authPaths);
  return {params: {api, config, logger: api.logger}, config: configArgs};
}

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

function getCallbackUrl(appConfig: ReturnType<typeof testConfig>) {
  return `${appConfig.appUrl}/auth/callback`;
}

async function getValidCallbackRequest(config: ReturnType<typeof testConfig>) {
  const cookieName = 'shopify_app_state';
  const state = 'nonce';
  const code = 'code_from_shopify';
  const now = Math.trunc(Date.now() / 1000) - 2;
  const queryParams = `code=${code}&host=${BASE64_HOST}&shop=${TEST_SHOP}&state=${state}&timestamp=${now}`;
  const hmac = await createSHA256HMAC(
    config.apiSecretKey,
    queryParams,
    HashFormat.Hex,
  );

  const request = new Request(
    `${getCallbackUrl(config)}?${queryParams}&hmac=${hmac}`,
  );

  signRequestCookie({
    request,
    cookieName,
    cookieValue: state,
  });

  return request;
}

async function mockCodeExchangeRequest(
  tokenType: 'online' | 'offline' = 'offline',
) {
  const responseBody = {
    access_token: '123abc',
    scope: 'read_products',
  };

  await mockExternalRequest({
    request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
      method: 'POST',
    }),
    response:
      tokenType === 'offline'
        ? new Response(JSON.stringify(responseBody))
        : new Response(
            JSON.stringify({
              ...responseBody,
              expires_in: Math.trunc(Date.now() / 1000) + 3600,
              associated_user_scope: 'read_products',
              associated_user: {
                id: 902541635,
                first_name: 'John',
                last_name: 'Smith',
                email: 'john@example.com',
                email_verified: true,
                account_owner: true,
                locale: 'en',
                collaborator: false,
              },
            }),
          ),
  });
}
