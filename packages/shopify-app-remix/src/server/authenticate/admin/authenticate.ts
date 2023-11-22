import {redirect} from '@remix-run/server-runtime';
import {
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
  rejectBotRequest as respondToBotRequest,
  respondToOptionsRequest,
  ensureCORSHeadersFactory,
  getSessionTokenFromUrlParam,
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
  createAdminApiContext,
  redirectFactory,
  redirectToShopifyOrAppRoot,
  renderAppBridge,
} from './helpers';
import {AuthorizationStrategy} from './strategies/types';

const SESSION_TOKEN_PARAM = 'id_token';

interface ShopWithSessionContext {
  sessionContext?: SessionContext;
  shop: string;
}

interface AuthStrategyParams extends BasicParams {
  strategy: AuthorizationStrategy;
}

export class AuthStrategy<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  protected strategy: AuthorizationStrategy;
  protected api: Shopify;
  protected config: AppConfig;
  protected logger: Shopify['logger'];

  public constructor({strategy, api, config, logger}: AuthStrategyParams) {
    this.api = api;
    this.config = config;
    this.logger = logger;
    this.strategy = strategy;
  }

  public async authenticateAdmin(
    request: Request,
  ): Promise<AdminContext<Config, Resources>> {
    const {api, logger, config} = this;

    let sessionContext: SessionContext;
    try {
      respondToBotRequest({api, logger, config}, request);
      respondToOptionsRequest({api, logger, config}, request);
      await this.respondToBouncePageRequest(request);
      await this.respondToExitIframeRequest(request);
      await this.strategy.respondToOAuthRequests(request);

      logger.info('Authenticating admin request');

      const sessionTokenHeader = getSessionTokenHeader(request);

      if (!sessionTokenHeader) {
        await this.validateUrlParams(request);
        await this.strategy.ensureInstalledOnShop(request);
        await this.ensureAppIsEmbeddedIfRequired(request);
        await this.ensureSessionTokenSearchParamIfRequired(request);
      }

      const authenticatedSession = await this.loadActiveSession(request);

      sessionContext = await this.strategy.acquireAccessToken({
        sessionContext: authenticatedSession.sessionContext,
        shop: authenticatedSession.shop,
        request,
      });
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        ensureCORSHeadersFactory(
          {api, logger, config},
          request,
        )(errorOrResponse);
      }

      throw errorOrResponse;
    }

    return this.createContext(request, sessionContext);
  }

  private async respondToBouncePageRequest(request: Request) {
    const {config, logger, api} = this;
    const url = new URL(request.url);

    if (url.pathname === config.auth.patchSessionTokenPath) {
      logger.debug('Rendering bounce page');
      throw renderAppBridge({config, logger, api}, request);
    }
  }

  private async respondToExitIframeRequest(request: Request) {
    const {config, logger, api} = this;
    const url = new URL(request.url);

    if (url.pathname === config.auth.exitIframePath) {
      const destination = url.searchParams.get('exitIframe')!;

      logger.debug('Rendering exit iframe page', {destination});
      throw renderAppBridge({config, logger, api}, request, {url: destination});
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
    const isEmbedded = url.searchParams.get('embedded') === '1';

    if (api.config.isEmbeddedApp && isEmbedded && !searchParamSessionToken) {
      logger.debug(
        'Missing session token in search params, going to bounce page',
        {shop},
      );
      this.redirectToBouncePage(url);
    }
  }

  private getShopFromSessionToken(payload: JwtPayload): string {
    const dest = new URL(payload.dest);
    return dest.hostname;
  }

  private async loadActiveSession(
    request: Request,
  ): Promise<ShopWithSessionContext> {
    const {config, logger, api} = this;

    let shop: string;
    let sessionId: string | undefined;
    let payload: JwtPayload | undefined;

    const sessionToken = (getSessionTokenHeader(request) ||
      getSessionTokenFromUrlParam(request))!;

    if (config.isEmbeddedApp) {
      payload = await validateSessionToken({config, logger, api}, sessionToken);
      shop = this.getShopFromSessionToken(payload);

      logger.debug('Session token is present, validating session', {shop});
      sessionId = config.useOnlineTokens
        ? api.session.getJwtSessionId(shop, payload.sub)
        : api.session.getOfflineId(shop);
    } else {
      const url = new URL(request.url);
      shop = url.searchParams.get('shop')!;

      // eslint-disable-next-line no-warning-comments
      // TODO move this check into loadSession once we add support for it in the library
      // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28378114
      sessionId = await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: request,
      });
    }

    if (!sessionId) {
      logger.debug('Session id not found in cookies, redirecting to OAuth', {
        shop,
      });
      return {shop};
    }

    logger.debug('Loading session from storage', {sessionId});

    const session = await config.sessionStorage.loadSession(sessionId);

    logger.debug('Found session, request is valid', {shop});

    return {sessionContext: session && {session, token: payload}, shop};
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

  private createContext(
    request: Request,
    sessionContext: SessionContext,
  ): AdminContext<Config, Resources> {
    const {api, logger, config} = this;

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
      cors: ensureCORSHeadersFactory({api, logger, config}, request),
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
