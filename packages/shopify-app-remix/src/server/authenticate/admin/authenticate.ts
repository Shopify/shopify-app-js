import {Session, Shopify, ShopifyRestResources} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import type {AppConfig, AppConfigArg} from '../../config-types';
import {
  getSessionTokenHeader,
  ensureCORSHeadersFactory,
  getSessionTokenFromUrlParam,
  respondToBotRequest,
  respondToOptionsRequest,
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
  renderAppBridge,
} from './helpers';
import {AuthorizationStrategy} from './strategies/types';

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
    const {config, logger} = this;
    const params = {api: this.api, logger, config};

    try {
      respondToBotRequest(params, request);
      respondToOptionsRequest(params, request);
      await this.respondToBouncePageRequest(params, request);
      await this.respondToExitIframeRequest(params, request);
      await this.strategy.respondToOAuthRequests(request);

      logger.info('Authenticating admin request');

      const headerSessionToken = getSessionTokenHeader(request);
      const searchParamSessionToken = getSessionTokenFromUrlParam(request);
      const sessionToken = (headerSessionToken || searchParamSessionToken)!;

      logger.debug('Attempting to authenticate session token', {
        sessionToken: {
          header: headerSessionToken,
          search: searchParamSessionToken,
        },
      });

      const sessionContext = await this.strategy.authenticate(
        request,
        sessionToken,
      );

      logger.debug('Request is valid, loaded session from session token', {
        shop: sessionContext.session.shop,
        isOnline: sessionContext.session.isOnline,
      });

      return this.createContext(request, sessionContext);
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        ensureCORSHeadersFactory(params, request)(errorOrResponse);
      }

      throw errorOrResponse;
    }
  }

  private async respondToBouncePageRequest(
    params: BasicParams,
    request: Request,
  ) {
    const {config, logger, api} = params;
    const url = new URL(request.url);

    if (url.pathname === config.auth.patchSessionTokenPath) {
      logger.debug('Rendering bounce page');
      throw renderAppBridge({config, logger, api}, request);
    }
  }

  private async respondToExitIframeRequest(
    params: BasicParams,
    request: Request,
  ) {
    const {config, logger, api} = params;
    const url = new URL(request.url);

    if (url.pathname === config.auth.exitIframePath) {
      const destination = url.searchParams.get('exitIframe')!;

      logger.debug('Rendering exit iframe page', {destination});
      throw renderAppBridge({config, logger, api}, request, {url: destination});
    }
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
