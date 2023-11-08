// import {redirect} from '@remix-run/server-runtime';
import {
  HttpResponseError,
  InvalidJwtError,
  JwtPayload,
  RequestedTokenType,
  Session,
  Shopify,
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
    const {api, logger, config} = this;
    const params: BasicParams = {api, logger, config};

    const url = new URL(request.url);

    const isPatchSessionToken =
      url.pathname === config.auth.patchSessionTokenPath;
    const isExitIframe = url.pathname === config.auth.exitIframePath;
    // const isAuthRequest = url.pathname === config.auth.path;

    if (isPatchSessionToken) {
      logger.debug('Rendering bounce page');
      throw renderAppBridge(params, request);
    } else if (isExitIframe) {
      const destination = url.searchParams.get('exitIframe')!;

      logger.debug('Rendering exit iframe page', {destination});
      throw renderAppBridge(params, request, {url: destination});
    }
    // else if (isAuthRequest) {
    //   const shop = ensureValidShopParam(request, {api, logger, config});
    //   const installUrl = `https://${shop}/admin/oauth/install?client_id=${config.apiKey}`;
    //   throw redirect(installUrl);
    // }

    const sessionTokenHeader = getSessionTokenHeader(request);
    const sessionTokenParam = url.searchParams.get(SESSION_TOKEN_PARAM)!;
    const sessionTokenString = sessionTokenHeader || sessionTokenParam;

    logger.info('Authenticating admin request');

    if (sessionTokenParam) {
      await validateUrlParams(request, {api, logger, config});
      await ensureAppIsEmbeddedIfRequired(request, {api, logger, config});
    }

    if (sessionTokenString) {
      try {
        const sessionToken = await validateSessionTokenUncaught(
          {api, logger, config},
          sessionTokenString,
        );

        return await this.getAccessToken(
          request,
          sessionTokenString,
          sessionToken,
        );
      } catch (error) {
        if (
          error instanceof InvalidJwtError ||
          (error instanceof HttpResponseError &&
            error.response.code === 400 &&
            error.response.body?.error === 'invalid_subject_token')
        ) {
          console.log(`CAUGHT ${JSON.stringify(error)}`);
          throw this.handleInvalidSession(request);
        }
        throw error;
      }
    } else {
      logger.debug(
        'Missing session token in search params, going to bounce page',
      );
      throw this.handleInvalidSession(request);
    }
  }

  private async getAccessToken(
    request: Request,
    sessionToken: string,
    payload: JwtPayload,
  ) {
    const {config, logger, api} = this;

    const sessionId = await api.session.getCurrentId({
      isOnline: config.useOnlineTokens,
      rawRequest: request,
    });

    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    if (sessionId) {
      logger.debug(`SESSION ID: ${sessionId}`);
      const persistedSession = await config.sessionStorage.loadSession(
        sessionId,
      );

      if (persistedSession) {
        logger.debug(`Reusing existing token: ${persistedSession.accessToken}`);

        //   if (!persistedSession.isExpired()) {
        return {session: persistedSession};
        //   }
      }
    }

    logger.debug(
      `Requesting token exchange online tokens? ${config.useOnlineTokens}`,
    );

    const {session} = await api.auth.tokenExchange({
      sessionToken,
      shop,
      requestedTokenType: config.useOnlineTokens
        ? RequestedTokenType.OnlineAccessToken
        : RequestedTokenType.OfflineAccessToken,
    });

    logger.debug(`RECEIVED TOKEN: ${session.accessToken}`);

    await config.sessionStorage.storeSession(session);

    return {session, token: payload};
  }

  private handleInvalidSession(request: Request) {
    const {api, logger, config} = this;

    const isXhrRequest = request.headers.get('authorization');
    if (!isXhrRequest) {
      return redirectToBouncePage(new URL(request.url), {api, logger, config});
    }

    return new Response(undefined, {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Invalid-Session': '1',
      },
    });
  }
}
