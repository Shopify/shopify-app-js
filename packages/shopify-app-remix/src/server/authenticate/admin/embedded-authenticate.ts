import {redirect} from '@remix-run/server-runtime';
import {
  HttpResponseError,
  InvalidJwtError,
  JwtPayload,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import {adminClientFactory} from '../../clients/admin';
import type {BasicParams} from '../../types';
import type {
  AdminApiContext,
  AppConfig,
  AppConfigArg,
} from '../../config-types';
import {
  getSessionTokenHeader,
  rejectBotRequest,
  respondToOptionsRequest,
  ensureCORSHeadersFactory,
  validateSessionTokenWithCallback,
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
} from './types';
import {
  handleClientErrorFactory,
  redirectFactory,
  renderAppBridge,
} from './helpers';

interface SessionContext {
  session: Session;
  token?: JwtPayload;
}

const SESSION_TOKEN_PARAM = 'id_token';

export class EmbeddedAuthStrategy<
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

    const context:
      | EmbeddedAdminContext<Config, Resources>
      | NonEmbeddedAdminContext<Config, Resources> = {
      admin: this.createAdminApiContext(request, sessionContext.session),
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

    const url = new URL(request.url);

    const isPatchSessionToken =
      url.pathname === config.auth.patchSessionTokenPath;

    if (isPatchSessionToken) {
      logger.debug('Rendering bounce page');
      throw renderAppBridge(params, request);
    }

    const sessionTokenHeader = getSessionTokenHeader(request);
    const sessionTokenParam = url.searchParams.get(SESSION_TOKEN_PARAM)!;
    const sessionTokenString = sessionTokenHeader || sessionTokenParam;

    logger.info('Authenticating admin request');

    if (sessionTokenParam) {
      await this.validateUrlParams(request);
      await this.ensureAppIsEmbeddedIfRequired(request);
    }

    if (sessionTokenString) {
      let sessionToken;

      try {
        sessionToken = await validateSessionTokenWithCallback(
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
          throw this.redirectToBouncePage(url);
        }
        throw error;
      }
    } else {
      logger.debug(
        'Missing session token in search params, going to bounce page',
      );
      throw this.redirectToBouncePage(url);
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
    const {logger} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop')!;

    if (url.searchParams.get('embedded') !== '1') {
      logger.debug('App is not embedded, redirecting to Shopify', {shop});
      await this.redirectToShopifyOrAppRoot(request);
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

    if (sessionId) {
      logger.debug(`SESSION ID: ${sessionId}`);
      const persistedSession = await config.sessionStorage.loadSession(
        sessionId,
      );
      if (persistedSession) {
        logger.debug(`Reusing existing token: ${persistedSession.accessToken}`);
        return {session: persistedSession};
      }
    }

    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    logger.debug('Requesting token exchange');

    const {session} = await api.auth.tokenExchange({
      sessionToken,
      shop,
      isOnline: config.useOnlineTokens,
    });

    logger.debug(`RECEIVED TOKEN: ${session.accessToken}`);

    await config.sessionStorage.storeSession(session);

    return {session, token: payload};
  }

  private async redirectToShopifyOrAppRoot(
    request: Request,
    responseHeaders?: Headers,
  ): Promise<never> {
    const {api} = this;
    const redirectUrl = await api.auth.getEmbeddedAppUrl({rawRequest: request});

    throw redirect(redirectUrl, {headers: responseHeaders});
  }

  private redirectToBouncePage(url: URL): never {
    const {api, config} = this;

    // eslint-disable-next-line no-warning-comments
    // TODO this is to work around a remix bug
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
    url.protocol = `${api.config.hostScheme}:`;

    const params = new URLSearchParams(url.search);
    params.set('shopify-reload', url.href);
    params.delete('id_token');

    // eslint-disable-next-line no-warning-comments
    // TODO Make sure this works on chrome without a tunnel (weird HTTPS redirect issue)
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
    throw redirect(`${config.auth.patchSessionTokenPath}?${params.toString()}`);
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

  private createAdminApiContext(
    request: Request,
    session: Session,
  ): AdminApiContext<Resources> {
    return adminClientFactory<Resources>({
      session,
      params: {
        api: this.api,
        config: this.config,
        logger: this.logger,
      },
      handleClientError: handleClientErrorFactory({
        request,
      }),
    });
  }
}
