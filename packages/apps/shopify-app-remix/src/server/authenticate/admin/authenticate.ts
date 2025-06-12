import {JwtPayload, Session, ShopifyRestResources} from '@shopify/shopify-api';
import {
  authAdminEmbedded,
  authAdminUnembedded,
  AuthResult,
} from '@shopify/shopify-app-js';

import type {BasicParams} from '../../types';
import type {AppConfigArg} from '../../config-types';
import {ensureCORSHeadersFactory, getShopFromRequest} from '../helpers';
import {toReq} from '../helpers/to-req';

import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
  checkBillingFactory,
  createUsageRecordFactory,
  updateUsageCappedAmountFactory,
} from './billing';
import type {
  AdminContext,
  AuthenticateAdmin,
  EmbeddedAdminContext,
  NonEmbeddedAdminContext,
} from './types';
import {createAdminApiContext, redirectFactory} from './helpers';
import {AuthorizationStrategy} from './strategies/types';
import {scopesApiFactory} from './scope/factory';

export interface SessionTokenContext {
  shop: string;
  sessionId?: string;
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
  const {logger, config} = params;

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
      admin: createAdminApiContext<ConfigArg, Resources>(
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
        updateUsageCappedAmount: updateUsageCappedAmountFactory(
          params,
          request,
          session,
        ),
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
    return {
      ...context,
      scopes: scopesApiFactory(params, context.session, context.admin),
    };
  }

  return async function authenticateAdmin(request: Request) {
    const req = toReq(request);
    const appConfig = {
      clientId: config.apiKey,
      clientSecret: config.apiSecretKey,
      appOrigin: config.appUrl,
      loginPath: config.auth.loginPath,
      exitIFramePath: config.auth.exitIframePath,
    };

    logger.info('Authenticating admin request', {
      shop: getShopFromRequest(request),
    });

    let result: AuthResult;

    if (config.isEmbeddedApp) {
      result = await authAdminEmbedded(req, {
        ...appConfig,
        patchSessionTokenPath: config.auth.patchSessionTokenPath,
      });
    } else {
      result = await authAdminUnembedded(req, {
        ...appConfig,
        authPath: config.auth.path,
        authCallbackPath: config.auth.callbackPath,
      });
    }

    if (!result.ok || !result.jwt || !result.jwt.object) {
      logger.error(result.action as string, {
        reason: result.action,
      });
      throw new Response(result.response.body, {
        status: result.response.status,
      });
    }

    try {
      const sessionToken = result.jwt.object as unknown as JwtPayload;
      const {shop, sessionId} = await getSessionTokenContext(
        params,
        request,
        sessionToken,
      );

      logger.debug('Loading session from storage', {shop, sessionId});
      const existingSession = sessionId
        ? await config.sessionStorage!.loadSession(sessionId)
        : undefined;

      const session = await strategy.authenticate(request, {
        session: existingSession,
        sessionToken: result.jwt.string,
        shop,
      });

      return createContext(request, session, strategy, sessionToken);
    } catch (errorOrResponse) {
      if (errorOrResponse instanceof Response) {
        logger.debug('Authenticate returned a response', {
          shop: getShopFromRequest(request),
        });
        ensureCORSHeadersFactory(params, request)(errorOrResponse);
      }

      throw errorOrResponse;
    }
  };
}

async function getSessionTokenContext(
  params: BasicParams,
  request: Request,
  sessionToken?: JwtPayload,
): Promise<SessionTokenContext> {
  const {api, config, logger} = params;

  if (sessionToken) {
    const dest = new URL(sessionToken.dest);
    const shop = dest.hostname;

    logger.debug('Session token is valid - authenticated', {
      shop,
      sessionToken,
    });

    const sessionId = config.useOnlineTokens
      ? api.session.getJwtSessionId(shop, sessionToken.sub)
      : api.session.getOfflineId(shop);

    return {shop, sessionId};
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get('shop')!;

  const sessionId = await api.session.getCurrentId({
    isOnline: config.useOnlineTokens,
    rawRequest: request,
  });

  return {shop, sessionId};
}