import type {MiddlewareFunction} from 'react-router';
import {JwtPayload, Session} from '@shopify/shopify-api';

import type {BasicParams} from '../types';
import {AppDistribution} from '../types';
import type {AppConfigArg} from '../config-types';
import {
  getSessionTokenHeader,
  ensureCORSHeadersFactory,
  getSessionTokenFromUrlParam,
  respondToBotRequest,
  respondToOptionsRequest,
  validateSessionToken,
  getShopFromRequest,
} from '../authenticate/helpers';
import {
  cancelBillingFactory,
  requestBillingFactory,
  checkBillingFactory,
  createUsageRecordFactory,
  updateUsageCappedAmountFactory,
} from '../authenticate/admin/billing';
import {
  createAdminApiContext,
  ensureAppIsEmbeddedIfRequired,
  ensureSessionTokenSearchParamIfRequired,
  redirectFactory,
  renderAppBridge,
  validateShopAndHostParams,
} from '../authenticate/admin/helpers';
import {AuthorizationStrategy} from '../authenticate/admin/strategies/types';
import {createTokenExchangeStrategy} from '../authenticate/admin/strategies/token-exchange';
import {createMerchantCustomAuthStrategy} from '../authenticate/admin/strategies/merchant-custom-app';

import type {
  AdminContext,
  AuthMiddlewareOptions,
  EmbeddedAdminContext,
  NonEmbeddedAdminContext,
} from './types';
import {adminContext, sessionContext, sessionTokenContext} from './contexts';

interface SessionTokenContext {
  shop: string;
  sessionId?: string;
  sessionToken?: string;
  payload?: JwtPayload;
}

/**
 * Creates authentication middleware that validates sessions and sets up admin context
 *
 * @param params - Basic app parameters (api, config, logger)
 * @param options - Optional authentication configuration
 * @returns React Router MiddlewareFunction
 *
 * @example
 * // In your route configuration
 * const shopify = shopifyApp(config);
 *
 * // Using middleware in routes
 * const routes = [
 *   {
 *     path: "/admin",
 *     middleware: [shopify.middleware.withAuthentication()],
 *     loader: ({ context }) => {
 *       const admin = context.get(adminContext);
 *       // Use admin context
 *     }
 *   }
 * ];
 */
export function createWithAuthentication<ConfigArg extends AppConfigArg>(
  params: BasicParams<ConfigArg['future']>,
  options?: AuthMiddlewareOptions,
): MiddlewareFunction {
  const {api, logger, config} = params;

  // Select authentication strategy
  const strategyName = options?.strategy || 'token-exchange';
  const strategyFactory =
    strategyName === 'merchant-custom'
      ? createMerchantCustomAuthStrategy
      : createTokenExchangeStrategy;

  const strategy = strategyFactory(params);

  async function respondToBouncePageRequest(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === config.auth.patchSessionTokenPath) {
      logger.debug('Rendering bounce page', {
        shop: getShopFromRequest(request),
      });
      throw renderAppBridge({config, logger, api}, request);
    }
  }

  async function respondToExitIframeRequest(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === config.auth.exitIframePath) {
      const destination = url.searchParams.get('exitIframe')!;

      logger.debug('Rendering exit iframe page', {
        shop: getShopFromRequest(request),
        destination,
      });
      throw renderAppBridge({config, logger, api}, request, {url: destination});
    }
  }

  async function getSessionTokenContextFromRequest(
    request: Request,
  ): Promise<SessionTokenContext> {
    const headerSessionToken = getSessionTokenHeader(request);
    const searchParamSessionToken = getSessionTokenFromUrlParam(request);
    const sessionToken = (headerSessionToken || searchParamSessionToken)!;

    logger.debug('Attempting to authenticate session token', {
      shop: getShopFromRequest(request),
      sessionToken: JSON.stringify({
        header: headerSessionToken,
        search: searchParamSessionToken,
      }),
    });

    if (config.distribution !== AppDistribution.ShopifyAdmin) {
      const payload = await validateSessionToken(params, request, sessionToken);
      const dest = new URL(payload.dest);
      const shop = dest.hostname;

      logger.debug('Session token is valid - authenticated', {shop, payload});
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

  function createAdminContext(
    request: Request,
    session: Session,
    authStrategy: AuthorizationStrategy,
    sessionToken?: JwtPayload,
  ): AdminContext<ConfigArg> {
    type AdminContextBase =
      | EmbeddedAdminContext<ConfigArg>
      | NonEmbeddedAdminContext<ConfigArg>;

    let context: AdminContextBase = {
      api: createAdminApiContext(
        session,
        params,
        authStrategy.handleClientError(request),
      ),
      billing: {
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
    };

    // Add embedded features if applicable
    if (config.distribution !== AppDistribution.ShopifyAdmin && sessionToken) {
      context = {
        ...context,
        sessionToken,
        redirect: redirectFactory(params, request, session.shop),
      } as EmbeddedAdminContext<ConfigArg>;
    }

    return context as AdminContext<ConfigArg>;
  }

  // Return the middleware function
  return async function withAuthenticationMiddleware(middlewareArgs, next) {
    const {request, context} = middlewareArgs;

    try {
      // Check if this path should be excluded
      if (options?.exclude) {
        const url = new URL(request.url);
        const excludePatterns = Array.isArray(options.exclude)
          ? options.exclude
          : [options.exclude];

        for (const pattern of excludePatterns) {
          if (pattern instanceof RegExp) {
            if (pattern.test(url.pathname)) {
              return next();
            }
          } else if (url.pathname === pattern) {
            return next();
          }
        }
      }

      // Handle special requests
      respondToBotRequest(params, request);
      respondToOptionsRequest(params, request);
      await respondToBouncePageRequest(request);
      await respondToExitIframeRequest(request);

      // If this is a valid request, but it doesn't have a session token header, this is a document request.
      // We need to ensure we're embedded if needed and we have the information needed to load the session.
      if (!getSessionTokenHeader(request)) {
        validateShopAndHostParams(params, request);
        await ensureAppIsEmbeddedIfRequired(params, request);
        await ensureSessionTokenSearchParamIfRequired(params, request);
      }

      logger.info('Authenticating admin request', {
        shop: getShopFromRequest(request),
      });

      const {payload, shop, sessionId, sessionToken} =
        await getSessionTokenContextFromRequest(request);

      logger.debug('Loading session from storage', {shop, sessionId});
      const existingSession = sessionId
        ? await config.sessionStorage!.loadSession(sessionId)
        : undefined;

      const session = await strategy.authenticate(request, {
        session: existingSession,
        sessionToken,
        shop,
      });

      // Create the admin context with all APIs
      const adminCtx = createAdminContext(request, session, strategy, payload);

      // Set contexts using React Router's context API
      context.set(adminContext, adminCtx);
      context.set(sessionContext, session);

      // Set sessionToken context for embedded apps
      if (payload) {
        context.set(sessionTokenContext, payload);
      }

      // Continue to next middleware/loader
      return next();
    } catch (errorOrResponse) {
      // Handle custom error handler
      if (options?.onError && !(errorOrResponse instanceof Response)) {
        const customResponse = await options.onError(errorOrResponse as Error);
        throw customResponse;
      }

      // Apply CORS headers if it's a Response
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
