import {
  CookieNotFound,
  GraphqlQueryError,
  HttpResponseError,
  InvalidHmacError,
  InvalidOAuthError,
  JwtPayload,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import type {AppConfig, AppConfigArg} from '../../config-types';
import {
  getSessionTokenHeader,
  validateSessionToken,
  rejectBotRequest,
  respondToOptionsRequest,
  ensureCORSHeadersFactory,
} from '../helpers';

import type {
  AdminContext,
} from './types';
import {
  beginAuth,
  handleClientErrorFactory,
  redirectToAuthPage,
  redirectWithExitIframe,
  renderAppBridge,
} from './helpers';
import {
  createAdminApiContext,
  createApiContext,
  ensureAppIsEmbeddedIfRequired,
  ensureValidShopParam,
  redirectToBouncePage,
  redirectToShopifyOrAppRoot,
  validateUrlParams,
} from './helpers/auth-helpers';

interface SessionContext {
  session: Session;
  token?: JwtPayload;
}

const SESSION_TOKEN_PARAM = 'id_token';

export class AuthStrategy<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  protected api: Shopify;
  protected config: AppConfig;
  protected logger: Shopify['logger'];

  public constructor({api, config, logger}: BasicParams) {
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
      handleClientErrorFactory,
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
    const isAuthRequest = url.pathname === config.auth.path;
    const isAuthCallbackRequest = url.pathname === config.auth.callbackPath;
    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info('Authenticating admin request');

    if (isPatchSessionToken) {
      logger.debug('Rendering bounce page');
      throw renderAppBridge(params, request);
    } else if (isExitIframe) {
      const destination = url.searchParams.get('exitIframe')!;

      logger.debug('Rendering exit iframe page', {destination});
      throw renderAppBridge(params, request, {url: destination});
    } else if (isAuthCallbackRequest) {
      throw await this.handleAuthCallbackRequest(request);
    } else if (isAuthRequest) {
      throw await this.handleAuthBeginRequest(request);
    } else if (sessionTokenHeader) {
      const sessionToken = await validateSessionToken(
        {api, logger, config},
        sessionTokenHeader,
      );

      return this.validateAuthenticatedSession(request, sessionToken);
    } else {
      await validateUrlParams(request, {api, logger, config});
      await this.ensureInstalledOnShop(request);
      await ensureAppIsEmbeddedIfRequired(request, {api, logger, config});
      await this.ensureSessionTokenSearchParamIfRequired(request);

      return this.ensureSessionExists(request);
    }
  }

  private async handleAuthBeginRequest(request: Request): Promise<never> {
    const {api, config, logger} = this;

    logger.info('Handling OAuth begin request');

    const shop = ensureValidShopParam(request, {api, logger, config});

    logger.debug('OAuth request contained valid shop', {shop});

    // If we're loading from an iframe, we need to break out of it
    if (
      config.isEmbeddedApp &&
      request.headers.get('Sec-Fetch-Dest') === 'iframe'
    ) {
      logger.debug('Auth request in iframe detected, exiting iframe', {shop});
      throw redirectWithExitIframe({api, config, logger}, request, shop);
    } else {
      throw await beginAuth({api, config, logger}, request, false, shop);
    }
  }

  private async handleAuthCallbackRequest(request: Request): Promise<never> {
    const {api, config, logger} = this;

    logger.info('Handling OAuth callback request');

    const shop = ensureValidShopParam(request, {api, logger, config});

    try {
      const {session, headers: responseHeaders} = await api.auth.callback({
        rawRequest: request,
      });

      await config.sessionStorage.storeSession(session);

      if (config.useOnlineTokens && !session.isOnline) {
        logger.info('Requesting online access token for offline session');
        await beginAuth({api, config, logger}, request, true, shop);
      }

      if (config.hooks.afterAuth) {
        logger.info('Running afterAuth hook');
        await config.hooks.afterAuth({
          session,
          admin: createAdminApiContext<Resources>(
            request,
            session,
            handleClientErrorFactory,
            {
              api,
              logger,
              config,
            },
          ),
        });
      }

      throw await redirectToShopifyOrAppRoot(
        request,
        {api, config, logger},
        responseHeaders,
      );
    } catch (error) {
      if (error instanceof Response) {
        throw error;
      }

      logger.error('Error during OAuth callback', {error: error.message});

      if (error instanceof CookieNotFound) {
        throw await this.handleAuthBeginRequest(request);
      } else if (
        error instanceof InvalidHmacError ||
        error instanceof InvalidOAuthError
      ) {
        throw new Response(undefined, {
          status: 400,
          statusText: 'Invalid OAuth Request',
        });
      } else {
        throw new Response(undefined, {
          status: 500,
          statusText: 'Internal Server Error',
        });
      }
    }
  }

  private async ensureInstalledOnShop(request: Request) {
    const {api, config, logger} = this;
    const url = new URL(request.url);

    let shop = url.searchParams.get('shop');
    const isEmbedded = url.searchParams.get('embedded') === '1';

    // Ensure app is installed
    logger.debug('Ensuring app is installed on shop', {shop});

    const offlineId = shop
      ? api.session.getOfflineId(shop)
      : await api.session.getCurrentId({isOnline: false, rawRequest: request});

    if (!offlineId) {
      logger.info("Could not find a shop, can't authenticate request");
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const offlineSession = await config.sessionStorage.loadSession(offlineId);

    if (!offlineSession) {
      logger.info("Shop hasn't installed app yet, redirecting to OAuth", {
        shop,
      });
      if (isEmbedded) {
        redirectWithExitIframe({api, config, logger}, request, shop!);
      } else {
        throw await beginAuth({api, config, logger}, request, false, shop!);
      }
    }

    shop = shop || offlineSession.shop;

    if (config.isEmbeddedApp && !isEmbedded) {
      try {
        logger.debug('Ensuring offline session is valid before embedding', {
          shop,
        });
        await this.testSession(offlineSession);

        logger.debug('Offline session is still valid, embedding app', {shop});
      } catch (error) {
        if (error instanceof HttpResponseError) {
          if (error.response.code === 401) {
            logger.info(
              'Shop session is no longer valid, redirecting to OAuth',
              {shop},
            );
            throw await beginAuth({api, config, logger}, request, false, shop);
          } else {
            const message = JSON.stringify(error.response.body, null, 2);
            logger.error(
              `Unexpected error during session validation: ${message}`,
              {shop},
            );

            throw new Response(undefined, {
              status: error.response.code,
              statusText: error.response.statusText,
            });
          }
        } else if (error instanceof GraphqlQueryError) {
          const context: {[key: string]: string} = {shop};
          if (error.response) {
            context.response = JSON.stringify(error.response);
          }

          logger.error(
            `Unexpected error during session validation: ${error.message}`,
            context,
          );

          throw new Response(undefined, {
            status: 500,
            statusText: 'Internal Server Error',
          });
        }
      }
    }
  }

  private async testSession(session: Session): Promise<void> {
    const {api} = this;

    const client = new api.clients.Graphql({
      session,
    });

    await client.query({
      data: `#graphql
        query shopifyAppShopName {
          shop {
            name
          }
        }
      `,
    });
  }

  private async ensureSessionTokenSearchParamIfRequired(request: Request) {
    const {api, config, logger} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop')!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM);

    if (api.config.isEmbeddedApp && !searchParamSessionToken) {
      logger.debug(
        'Missing session token in search params, going to bounce page',
        {shop},
      );
      redirectToBouncePage(url, {api, logger, config});
    }
  }

  private async ensureSessionExists(request: Request): Promise<SessionContext> {
    const {api, config, logger} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop')!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM)!;

    if (api.config.isEmbeddedApp) {
      logger.debug(
        'Session token is present in query params, validating session',
        {shop},
      );

      const sessionToken = await validateSessionToken(
        {api, config, logger},
        searchParamSessionToken,
      );

      return this.validateAuthenticatedSession(request, sessionToken);
    } else {
      // eslint-disable-next-line no-warning-comments
      // TODO move this check into loadSession once we add support for it in the library
      // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28378114
      const sessionId = await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: request,
      });
      if (!sessionId) {
        logger.debug('Session id not found in cookies, redirecting to OAuth', {
          shop,
        });
        throw await beginAuth({api, config, logger}, request, false, shop);
      }

      return {session: await this.loadSession(request, shop, sessionId)};
    }
  }

  private async validateAuthenticatedSession(
    request: Request,
    payload: JwtPayload,
  ): Promise<SessionContext> {
    const {config, logger, api} = this;

    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    const sessionId = config.useOnlineTokens
      ? api.session.getJwtSessionId(shop, payload.sub)
      : api.session.getOfflineId(shop);

    const session = await this.loadSession(request, shop, sessionId);

    logger.debug('Found session, request is valid', {shop});

    return {session, token: payload};
  }

  private async loadSession(
    request: Request,
    shop: string,
    sessionId: string,
  ): Promise<Session> {
    const {api, config, logger} = this;

    logger.debug('Loading session from storage', {sessionId});

    const session = await config.sessionStorage.loadSession(sessionId);
    if (!session) {
      logger.debug('No session found, redirecting to OAuth', {shop});
      await redirectToAuthPage({api, config, logger}, request, shop);
    } else if (!session.isActive(config.scopes)) {
      logger.debug(
        'Found a session, but it has expired, redirecting to OAuth',
        {shop},
      );
      await redirectToAuthPage({api, config, logger}, request, shop);
    }

    return session!;
  }
}
