import {ShopifyRestResources} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import type {AppConfigArg} from '../../config-types';
import {
  getSessionTokenHeader,
  ensureCORSHeadersFactory,
  getSessionTokenFromUrlParam,
  respondToBotRequest,
  respondToOptionsRequest,
} from '../helpers';

import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
} from './billing';
import type {
  AdminContext,
  AuthenticateAdmin,
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

export function authStrategyFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
>({
  strategy,
  ...params
}: AuthStrategyParams): AuthenticateAdmin<ConfigArg, Resources> {
  const {api, logger, config} = params;

  async function respondToBouncePageRequest(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === config.auth.patchSessionTokenPath) {
      logger.debug('Rendering bounce page');
      throw renderAppBridge({config, logger, api}, request);
    }
  }

  async function respondToExitIframeRequest(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === config.auth.exitIframePath) {
      const destination = url.searchParams.get('exitIframe')!;

      logger.debug('Rendering exit iframe page', {destination});
      throw renderAppBridge({config, logger, api}, request, {url: destination});
    }
  }

  function createContext(
    request: Request,
    sessionContext: SessionContext,
  ): AdminContext<ConfigArg, Resources> {
    const {session} = sessionContext;

    const context:
      | EmbeddedAdminContext<ConfigArg, Resources>
      | NonEmbeddedAdminContext<ConfigArg, Resources> = {
      admin: createAdminApiContext<Resources>(request, sessionContext.session, {
        api,
        logger,
        config,
      }),
      billing: {
        require: requireBillingFactory({api, logger, config}, request, session),
        request: requestBillingFactory({api, logger, config}, request, session),
        cancel: cancelBillingFactory({api, logger, config}, request, session),
      },
      session: sessionContext.session,
      cors: ensureCORSHeadersFactory({api, logger, config}, request),
    };

    if (config.isEmbeddedApp) {
      return {
        ...context,
        sessionToken: sessionContext!.token!,
        redirect: redirectFactory({api, config, logger}, request),
      } as AdminContext<ConfigArg, Resources>;
    } else {
      return context as AdminContext<ConfigArg, Resources>;
    }
  }

  return async function authenticateAdmin(request: Request) {
    try {
      respondToBotRequest(params, request);
      respondToOptionsRequest(params, request);
      await respondToBouncePageRequest(request);
      await respondToExitIframeRequest(request);
      await strategy.respondToOAuthRequests(request);

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

      const sessionContext = await strategy.authenticate(request, sessionToken);

      logger.debug('Request is valid, loaded session from session token', {
        shop: sessionContext.session.shop,
        isOnline: sessionContext.session.isOnline,
      });

      return createContext(request, sessionContext);
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        ensureCORSHeadersFactory(params, request)(errorOrResponse);
      }

      throw errorOrResponse;
    }
  };
}
