import {redirect} from '@remix-run/server-runtime';
import {
  CookieNotFound,
  InvalidHmacError,
  InvalidOAuthError,
  JwtPayload,
  Session,
  Shopify,
  ShopifyRestResources,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import type {
  AdminApiContext,
  AppConfig,
  AppConfigArg,
} from '../../config-types';
import type {BillingContext} from '../../billing/types';
import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
} from '../../billing';
import {
  appBridgeUrl,
  addDocumentResponseHeaders,
  beginAuth,
  getSessionTokenHeader,
  redirectWithExitIframe,
  redirectToAuthPage,
  validateSessionToken,
  rejectBotRequest,
  respondToOptionsRequest,
  ensureCORSHeadersFactory,
} from '../helpers';

import type {
  AdminContext,
  EmbeddedAdminContext,
  NonEmbeddedAdminContext,
} from './types';
import {graphqlClientFactory} from './graphql-client';
import {RemixRestClient, restResourceClientFactory} from './rest-client';

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
  ): Promise<EmbeddedAdminContext<Config, Resources>> {
    const {api, logger, config} = this;

    if (!api.config.isEmbeddedApp) {
      throw Error('You cannot use token exchange for a non embedded app')
    }

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

    return {
      admin: this.createAdminApiContext(request, sessionContext.session),
      billing: this.createBillingContext(request, sessionContext.session),
      session: sessionContext.session,
      cors,
      sessionToken: sessionContext!.token!,
    };
  }

  private async authenticateAndGetSessionContext(
    request: Request,
  ): Promise<SessionContext> {
    const {api, logger, config} = this;

    const url = new URL(request.url);

    const isPatchSessionToken =
      url.pathname === config.auth.patchSessionTokenPath;
    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info('Authenticating admin request');

    if (isPatchSessionToken) {
      logger.debug('Rendering bounce page');
      throw this.renderAppBridge(request);
    } else if (sessionTokenHeader) {
      const sessionToken = await validateSessionToken(
        {api, logger, config},
        sessionTokenHeader,
      );

      return this.getTokenViaTokenExchange(
        request,
        sessionTokenHeader,
        sessionToken,
      );
    } else {
      await this.validateUrlParams(request);
      await this.ensureAppIsEmbeddedIfRequired(request);
      await this.ensureSessionTokenSearchParamIfRequired(request);

      return this.ensureSessionExists(request);
    }
  }

  private async validateUrlParams(request: Request) {
    const {api, config, logger} = this;

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

  private async ensureAppIsEmbeddedIfRequired(request: Request) {
    const {logger} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop')!;

    if (url.searchParams.get('embedded') !== '1') {
      logger.debug('App is not embedded, redirecting to Shopify', {shop});
      await this.redirectToShopifyOrAppRoot(request);
    }
  }

  private async ensureSessionTokenSearchParamIfRequired(request: Request) {
    const {logger} = this;
    const url = new URL(request.url);

    const shop = url.searchParams.get('shop')!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM);

    if (!searchParamSessionToken) {
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

    const shop = url.searchParams.get('shop')!;
    const searchParamSessionToken = url.searchParams.get(SESSION_TOKEN_PARAM)!;

    logger.debug(
      'Session token is present in query params, validating session',
      {shop},
    );

    const sessionToken = await validateSessionToken(
      {api, config, logger},
      searchParamSessionToken,
    );

    return this.getTokenViaTokenExchange(
      request,
      searchParamSessionToken,
      sessionToken,
    );
  }

  private async getTokenViaTokenExchange(
    request: Request,
    sessionToken: string,
    payload: JwtPayload,
  ): Promise<SessionContext> {
    const {config, logger, api} = this;

    const sessionId = await api.session.getCurrentId({
      isOnline: config.useOnlineTokens,
      rawRequest: request,
    });

    if (sessionId) {
      const persistedSession = await config.sessionStorage.loadSession(sessionId);
      if (persistedSession) {
        logger.debug('Reusing existing token')
        return {session: persistedSession, token: payload}
      }
    }

    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    logger.debug('Requesting token exchange');

    const {session} = await api.auth.exchange({
      sessionToken,
      shop,
      isOnline: config.useOnlineTokens,
    });

    logger.info(`RECEIVED TOKEN: ${session}`);

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

    // eslint-disable-next-line no-warning-comments
    // TODO Make sure this works on chrome without a tunnel (weird HTTPS redirect issue)
    // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
    throw redirect(`${config.auth.patchSessionTokenPath}?${params.toString()}`);
  }

  private renderAppBridge(request: Request, redirectTo?: string): never {
    const {config} = this;

    let redirectToScript = '';
    if (redirectTo) {
      const redirectUrl = decodeURIComponent(
        redirectTo.startsWith('/')
          ? `${config.appUrl}${redirectTo}`
          : redirectTo,
      );

      redirectToScript = `<script>window.open("${redirectUrl}", "_top")</script>`;
    }

    const responseHeaders = new Headers({
      'content-type': 'text/html;charset=utf-8',
    });
    addDocumentResponseHeaders(
      responseHeaders,
      config.isEmbeddedApp,
      new URL(request.url).searchParams.get('shop'),
    );

    throw new Response(
      `
        <script data-api-key="${
          config.apiKey
        }" src="${appBridgeUrl()}"></script>
        ${redirectToScript}
      `,
      {headers: responseHeaders},
    );
  }

  private overriddenRestClient(request: Request, session: Session) {
    const {api, config, logger} = this;

    const client = new RemixRestClient<Resources>({
      params: {api, config, logger},
      request,
      session,
    });

    if (api.rest) {
      client.resources = {} as Resources;

      const RestResourceClient = restResourceClientFactory({
        params: {api, config, logger},
        request,
        session,
      });
      Object.entries(api.rest).forEach(([name, resource]) => {
        class RemixResource extends resource {
          public static Client = RestResourceClient;
        }

        Reflect.defineProperty(RemixResource, 'name', {
          value: name,
        });

        Reflect.set(client.resources, name, RemixResource);
      });
    }

    return client;
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
    const {api, config, logger} = this;

    return {
      rest: this.overriddenRestClient(request, session),
      graphql: graphqlClientFactory({
        params: {api, config, logger},
        request,
        session,
      }),
    };
  }
}
