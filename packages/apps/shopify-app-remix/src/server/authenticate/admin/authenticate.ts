import {JwtPayload, Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';
import type {AppConfigArg} from '../../config-types';
import {
  getSessionTokenHeader,
  ensureCORSHeadersFactory,
  getSessionTokenFromUrlParam,
  respondToBotRequest,
  respondToOptionsRequest,
  validateSessionToken,
} from '../helpers';

import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
  checkBillingFactory,
  createUsageRecordFactory,
} from './billing';
import type {
  AdminContext,
  AuthenticateAdmin,
  EmbeddedAdminContext,
  NonEmbeddedAdminContext,
} from './types';
import {
  createAdminApiContext,
  ensureAppIsEmbeddedIfRequired,
  ensureSessionTokenSearchParamIfRequired,
  redirectFactory,
  renderAppBridge,
  validateShopAndHostParams,
} from './helpers';
import {AuthorizationStrategy} from './strategies/types';
import {scopesApiFactory} from './scope/factory';

export interface SessionTokenContext {
  shop: string;
  sessionId?: string;
  sessionToken?: string;
  payload?: JwtPayload;
}

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

  type AdminContextBase =
    | EmbeddedAdminContext<ConfigArg, Resources>
    | NonEmbeddedAdminContext<ConfigArg, Resources>;

  function createContext(
    request: Request,
    session: Session,
    authStrategy: AuthorizationStrategy,
    sessionToken?: JwtPayload,
  ): AdminContext<ConfigArg, Resources> {
    let context: AdminContextBase = {
      admin: createAdminApiContext<Resources>(
        session,
        params,
        authStrategy.handleClientError(request),
      ),
      billing: {
        require: requireBillingFactory(params, request, session),
        check: checkBillingFactory(params, request, session),
        request: requestBillingFactory(params, request, session),
        cancel: cancelBillingFactory(params, request, session),
        createUsageRecord: createUsageRecordFactory(params, request, session),
      },

      session,
      cors: ensureCORSHeadersFactory(params, request),
    };

    context = addEmbeddedFeatures(context, request, session, sessionToken);
    context = addScopesFeatures(context);

    return context as AdminContext<ConfigArg, Resources>;
  }

  function addEmbeddedFeatures(
    context: AdminContextBase,
    request: Request,
    session: Session,
    sessionToken?: JwtPayload,
  ) {
    if (config.isEmbeddedApp) {
      return {
        ...context,
        sessionToken,
        redirect: redirectFactory(params, request, session.shop),
      };
    }
    return context;
  }

  function addScopesFeatures(context: AdminContextBase) {
    if (config.future.wip_optionalScopesApi) {
      return {
        ...context,
        scopes: scopesApiFactory(params, context.session, context.admin),
      };
    }
    return context;
  }

  return async function authenticateAdmin(request: Request) {
    try {
      respondToBotRequest(params, request);
      respondToOptionsRequest(params, request);
      await respondToBouncePageRequest(request);
      await respondToExitIframeRequest(request);
      await strategy.respondToOAuthRequests(request);

      // If this is a valid request, but it doesn't have a session token header, this is a document request. We need to
      // ensure we're embedded if needed and we have the information needed to load the session.
      if (!getSessionTokenHeader(request)) {
        validateShopAndHostParams(params, request);
        await ensureAppIsEmbeddedIfRequired(params, request);
        await ensureSessionTokenSearchParamIfRequired(params, request);
      }

      logger.info('Authenticating admin request');

      const {payload, shop, sessionId, sessionToken} =
        await getSessionTokenContext(params, request);

      logger.debug('Loading session from storage', {sessionId});
      const existingSession = sessionId
        ? await config.sessionStorage!.loadSession(sessionId)
        : undefined;

      const session = await strategy.authenticate(request, {
        session: existingSession,
        sessionToken,
        shop,
      });

      return createContext(request, session, strategy, payload);
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        logger.debug('Authenticate returned a response');
        ensureCORSHeadersFactory(params, request)(errorOrResponse);
      }

      throw errorOrResponse;
    }
  };
}

async function getSessionTokenContext(
  params: BasicParams,
  request: Request,
): Promise<SessionTokenContext> {
  const {api, config, logger} = params;

  const headerSessionToken = getSessionTokenHeader(request);
  const searchParamSessionToken = getSessionTokenFromUrlParam(request);
  const sessionToken = (headerSessionToken || searchParamSessionToken)!;

  logger.debug('Attempting to authenticate session token', {
    sessionToken: JSON.stringify({
      header: headerSessionToken,
      search: searchParamSessionToken,
    }),
  });

  if (config.isEmbeddedApp) {
    const payload = await validateSessionToken(params, request, sessionToken);
    const dest = new URL(payload.dest);
    const shop = dest.hostname;

    logger.debug('Session token is valid', {shop, payload});
    const sessionId = config.useOnlineTokens
      ? api.session.getJwtSessionId(shop, payload.sub)
      : api.session.getOfflineId(shop);

    return {shop, payload, sessionId, sessionToken};
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get('shop')!;

  const sessionId = await api.session.getCurrentId({
    isOnline: config.useOnlineTokens,
    rawRequest: request,
  });

  return {shop, sessionId, payload: undefined, sessionToken};
}
