// import {redirect} from '@remix-run/server-runtime';
import {
  HttpResponseError,
  InvalidJwtError,
  JwtPayload,
  RequestedTokenType,
  Session,
  Shopify,
  ShopifyError,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import type {AppConfig, AppConfigArg} from '../../config-types';
import {
  getSessionTokenHeader,
  rejectBotRequest,
  respondToOptionsRequest,
  ensureCORSHeadersFactory,
  validateSessionTokenUncaught,
} from '../helpers';
import {type MockApiConfig} from '../../shopify-app';

import type {AdminContext} from './types';
import {
  handleEmbeddedClientErrorFactory,
  // redirectWithAppBridgeHeaders,
  // redirectWithExitIframe,
  renderAppBridge,
} from './helpers';
import {
  createApiContext,
  ensureAppIsEmbeddedIfRequired,
  // ensureValidShopParam,
  redirectToBouncePage,
  validateUrlParams,
} from './helpers/auth-helpers';

interface SessionContext {
  session: Session;
  token?: JwtPayload;
}

const SESSION_TOKEN_PARAM = 'id_token';

export class EmbeddedAuthStrategy<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  protected api: Shopify<MockApiConfig<Config['future']>>;
  protected config: AppConfig;
  protected logger: Shopify['logger'];

  public constructor({api, config, logger}: BasicParams<Config['future']>) {
    this.api = api;
    this.config = config;
    this.logger = logger;
  }

  public async authenticateAdmin(
    request: Request,
  ): Promise<AdminContext<Config, Resources>> {
    const {api, logger, config} = this;
    logger.info('shopify-app-remix is local');

    rejectBotRequest({api, logger, config}, request);
    respondToOptionsRequest({api, logger, config}, request);

    const cors = ensureCORSHeadersFactory({api, logger, config}, request);

    let sessionContext: SessionContext;
    try {
      sessionContext = await this.authenticateAndGetSessionContext(request);
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        cors(errorOrResponse);
      }

      throw errorOrResponse;
    }

    return createApiContext<Config, Resources>(
      {api, logger, config},
      request,
      sessionContext,
      cors,
      handleEmbeddedClientErrorFactory,
    );
  }

  private async authenticateAndGetSessionContext(
    request: Request,
  ): Promise<SessionContext> {
    const {api, logger} = this;

    const sessionTokenHeader = api.session.sessionTokenFromHeader(request);
    const sessionTokenParam = api.session.sessionTokenFromParam(request);
    const sessionToken = sessionTokenHeader || sessionTokenParam;

    logger.info('Authenticating admin request');

    if (sessionToken) {
      const sessionTokenPayload = await api.session.decodeSessionToken(
        sessionToken,
        {
          checkAudience: true,
        },
      );

      if (this.config.useOnlineTokens) {
        this.getAccessToken(request, sessionToken, sessionTokenPayload, false);
      }
      return this.getAccessToken(
        request,
        sessionToken,
        sessionTokenPayload,
        this.config.useOnlineTokens,
      );
    } else {
      logger.debug(
        'Missing session token in search params, going to bounce page',
      );
      throw new ShopifyError('Session token was not found');
    }
  }

  private async getAccessToken(
    request: Request,
    sessionToken: string,
    payload: JwtPayload,
    isOnline: boolean,
  ) {
    const {config, logger, api} = this;

    const sessionId = await api.session.getCurrentId({
      isOnline,
      rawRequest: request,
    });

    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    if (sessionId) {
      const persistedSession = await config.sessionStorage.loadSession(
        sessionId,
      );

      if (persistedSession && !persistedSession.isExpired()) {
        return {session: persistedSession};
      }
    }

    logger.debug(
      `Performing token exchange for shop: ${shop} & sessionId: ${sessionId}`,
    );
    const {session} = await api.auth.tokenExchange({
      sessionToken,
      shop,
      requestedTokenType: isOnline
        ? RequestedTokenType.OnlineAccessToken
        : RequestedTokenType.OfflineAccessToken,
    });

    await config.sessionStorage.storeSession(session);

    // if (config.hooks.afterAuth) {
    //   logger.info('Running afterAuth hook');
    //   await config.hooks.afterAuth({
    //     session,
    //     admin: createApiContext<Resources>(
    //       request,
    //       session,
    //       handleClientErrorFactory,
    //       {
    //         api,
    //         logger,
    //         config,
    //       },
    //     ),
    //   });
    // }

    return {session, token: payload};
  }
}
