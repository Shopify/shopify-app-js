import {redirect} from '@remix-run/server-runtime';
import {
  GraphqlQueryError,
  HttpResponseError,
  JwtPayload,
  Session,
  Shopify,
  ShopifyError,
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

import type {BillingContext} from './billing/types';
import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
} from './billing';
import type {
  AdminContext,
  EmbeddedAdminContext,
  NonEmbeddedAdminContext,
  SessionContext,
} from './types';
import {
  beginAuth,
  createAdminApiContext,
  redirectFactory,
  redirectToAuthPage,
  redirectToShopifyOrAppRoot,
  redirectWithExitIframe,
} from './helpers';
import {AuthCodeFlowStrategy} from './strategies/auth-code-flow';

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

    const context:
      | EmbeddedAdminContext<Config, Resources>
      | NonEmbeddedAdminContext<Config, Resources> = {
      admin: createAdminApiContext<Resources>(request, sessionContext.session, {
        api,
        logger,
        config,
      }),
      billing: this.createBillingContext(request, sessionContext.session),
      session: sessionContext.session,
      cors,
    };

    if (config.isEmbeddedApp) {
      return {
        ...context,
        sessionToken: sessionContext!.token!,
        redirect: redirectFactory({api, config, logger}, request),
      } as AdminContext<Config, Resources>;
    } else {
      return context as AdminContext<Config, Resources>;
    }
  }

  private async authenticateAndGetSessionContext(
    request: Request,
  ): Promise<SessionContext> {
    const {api, logger, config} = this;
    const params: BasicParams = {api, logger, config};
    logger.info('Authenticating admin request');

    const strategy = new AuthCodeFlowStrategy();

    await strategy.handleRoutes(request, params);

    const sessionTokenHeader = getSessionTokenHeader(request);

    if (sessionTokenHeader) {
      const sessionToken = await validateSessionToken(
        params,
        sessionTokenHeader,
      );

      const shop = this.getShopFromSessionToken(sessionToken);
      const sessionContext = await this.getAuthenticatedSession({
        payload: sessionToken,
      });

      return strategy.manageAccessToken(sessionContext, shop, request, params);
    } else {
      await this.validateUrlParams(request);
      await this.ensureInstalledOnShop(request);
      await this.ensureAppIsEmbeddedIfRequired(request);
      await this.ensureSessionTokenSearchParamIfRequired(request);

      return this.ensureSessionExists(request);
    }
  }

  private async validateUrlParams(request: Request) {
    const {api, config, logger} = this;

    if (config.isEmbeddedApp) {
      const url = new URL(request.url);
      const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
      if (!shop) {
        logger.debug('Missing or invalid shop, redirecting to login path', {
          shop,
        });
        throw redirect(config.auth.loginPath);
      }

      const host = api.utils.sanitizeHost(url.searchParams.get('host')!);
      if (!host) {
        logger.debug('Invalid host, redirecting to login path', {
          host: url.searchParams.get('host'),
        });
        throw redirect(config.auth.loginPath);
      }
    }
  }

  private async getOfflineToken(request: Request) {
    const {api, config, logger} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop');

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

    return config.sessionStorage.loadSession(offlineId);
  }

  private async ensureInstalledOnShop(request: Request) {
    const {api, config, logger} = this;
    const url = new URL(request.url);

    let shop = url.searchParams.get('shop');

    // Ensure app is installed
    logger.debug('Ensuring app is installed on shop', {shop});

    const offlineSession = await this.getOfflineToken(request);
    const isEmbedded = url.searchParams.get('embedded') === '1';

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
        await this.handleInvalidOfflineSession(
          error,
          {api, logger, config},
          request,
          shop,
        );
      }
    }
  }

  private async handleInvalidOfflineSession(
    error: Error,
    params: BasicParams,
    request: Request,
    shop: string,
  ) {
    const {api, logger, config} = params;
    if (error instanceof HttpResponseError) {
      if (error.response.code === 401) {
        logger.info('Shop session is no longer valid, redirecting to OAuth', {
          shop,
        });
        throw await beginAuth({api, config, logger}, request, false, shop);
      } else {
        const message = JSON.stringify(error.response.body, null, 2);
        logger.error(`Unexpected error during session validation: ${message}`, {
          shop,
        });

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

  private async ensureAppIsEmbeddedIfRequired(request: Request) {
    const {api, logger, config} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop')!;

    if (api.config.isEmbeddedApp && url.searchParams.get('embedded') !== '1') {
      logger.debug('App is not embedded, redirecting to Shopify', {shop});
      await redirectToShopifyOrAppRoot(request, {api, logger, config});
    }
  }

  private async ensureSessionTokenSearchParamIfRequired(request: Request) {
    const {api, logger} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop')!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM);

    if (api.config.isEmbeddedApp && !searchParamSessionToken) {
      logger.debug(
        'Missing session token in search params, going to bounce page',
        {shop},
      );
      this.redirectToBouncePage(url);
    }
  }

  private async ensureSessionExists(request: Request): Promise<SessionContext> {
    const {api, config, logger} = this;
    const url = new URL(request.url);

    let shop = url.searchParams.get('shop')!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM)!;

    let sessionContext: SessionContext | null;
    if (api.config.isEmbeddedApp) {
      logger.debug(
        'Session token is present in query params, validating session',
        {shop},
      );

      const sessionToken = await validateSessionToken(
        {api, config, logger},
        searchParamSessionToken,
      );
      shop = this.getShopFromSessionToken(sessionToken);

      sessionContext = await this.getAuthenticatedSession({
        payload: sessionToken,
      });
      // return sessionContext!;
    } else {
      // eslint-disable-next-line no-warning-comments
      // TODO move this check into loadSession once we add support for it in the library
      // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28378114
      // const sessionId = await api.session.getCurrentId({
      //   isOnline: config.useOnlineTokens,
      //   rawRequest: request,
      // });
      // if (!sessionId) {
      //   logger.debug('Session id not found in cookies, redirecting to OAuth', {
      //     shop,
      //   });
      //   throw await redirectToAuthPage({api, config, logger}, request, shop);
      // }

      sessionContext = await this.getAuthenticatedSession({request});
    }

    if (!sessionContext || !sessionContext.session.isActive(config.scopes)) {
      const debugMessage = sessionContext
        ? 'Found a session, but it has expired, redirecting to OAuth'
        : 'No session found, redirecting to OAuth';
      logger.debug(debugMessage, {shop});
      await redirectToAuthPage({api, config, logger}, request, shop);
    }

    return sessionContext!;
  }

  private getShopFromSessionToken(payload: JwtPayload): string {
    const dest = new URL(payload.dest);
    return dest.hostname;
  }

  private async getAuthenticatedSession({
    payload,
    request,
  }: {
    payload?: JwtPayload;
    request?: Request;
  }): Promise<SessionContext | null> {
    const {config, logger, api} = this;

    let shop: string;
    let sessionId: string | undefined;

    if (config.isEmbeddedApp && payload) {
      shop = this.getShopFromSessionToken(payload);
      sessionId = config.useOnlineTokens
        ? api.session.getJwtSessionId(shop, payload.sub)
        : api.session.getOfflineId(shop);
    } else if (!config.isEmbeddedApp && request) {
      const url = new URL(request.url);
      shop = url.searchParams.get('shop')!;

      // eslint-disable-next-line no-warning-comments
      // TODO move this check into loadSession once we add support for it in the library
      // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28378114
      sessionId = await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: request,
      });
    } else {
      throw new ShopifyError();
    }

    if (!sessionId) {
      return null;
    }

    const session = await this.loadSession(sessionId);

    logger.debug('Found session, request is valid', {shop});

    return session ? {session, shop, token: payload} : null;
  }

  private async loadSession(sessionId: string): Promise<Session | undefined> {
    const {config, logger} = this;

    logger.debug('Loading session from storage', {sessionId});

    return config.sessionStorage.loadSession(sessionId);
  }

  private redirectToBouncePage(url: URL): never {
    const {config} = this;

    // Make sure we always point to the configured app URL so it also works behind reverse proxies (that alter the Host
    // header).
    url.searchParams.set(
      'shopify-reload',
      `${config.appUrl}${url.pathname}${url.search}`,
    );

    // eslint-disable-next-line no-warning-comments
    // TODO Make sure this works on chrome without a tunnel (weird HTTPS redirect issue)
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
    throw redirect(`${config.auth.patchSessionTokenPath}${url.search}`);
  }

  private createBillingContext(
    request: Request,
    session: Session,
  ): BillingContext<Config> {
    const {api, logger, config} = this;

    return {
      require: requireBillingFactory({api, logger, config}, request, session),
      request: requestBillingFactory({api, logger, config}, request, session),
      cancel: cancelBillingFactory({api, logger, config}, request, session),
    };
  }
}
