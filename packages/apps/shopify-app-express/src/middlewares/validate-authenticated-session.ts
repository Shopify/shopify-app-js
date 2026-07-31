import {Session, Shopify, InvalidJwtError} from '@shopify/shopify-api';
import {Request, Response, NextFunction} from 'express';

import {redirectToAuth} from '../redirect-to-auth';
import {ApiAndConfigParams} from '../types';
import {redirectOutOfApp} from '../redirect-out-of-app';
import {ensureOfflineTokenIsNotExpired} from '../helpers/index';
import {getSessionToken} from '../helpers/get-session-token';
import {respondToInvalidSessionToken} from '../helpers/respond-to-invalid-session-token';

import {ValidateAuthenticatedSessionMiddleware} from './types';
import {hasValidAccessToken} from './has-valid-access-token';
import {performTokenExchange} from './perform-token-exchange';

type validateAuthenticatedSessionParams = ApiAndConfigParams;

export function validateAuthenticatedSession({
  api,
  config,
}: validateAuthenticatedSessionParams): ValidateAuthenticatedSessionMiddleware {
  return function validateAuthenticatedSession() {
    return async (req: Request, res: Response, next: NextFunction) => {
      config.logger.debug('Running validateAuthenticatedSession');

      // One branch, up front: embedded apps that opted into token exchange use
      // it; everything else uses the legacy OAuth code flow. The two paths are
      // fully independent below.
      const useTokenExchange =
        config.future?.unstable_tokenExchange && api.config.isEmbeddedApp;

      if (useTokenExchange) {
        return validateWithTokenExchange({req, res, next, api, config});
      }

      return validateWithAuthCodeFlow({req, res, next, api, config});
    };
  };
}

interface StrategyParams extends ApiAndConfigParams {
  req: Request;
  res: Response;
  next: NextFunction;
}

async function validateWithTokenExchange({
  req,
  res,
  next,
  api,
  config,
}: StrategyParams): Promise<void> {
  const sessionToken = getSessionToken(req);

  if (!sessionToken) {
    config.logger.debug('No session token found for token exchange');
    respondToInvalidSessionToken({
      api,
      req,
      res,
      message: 'No session token found',
      retryRequest: true,
    });
    return;
  }

  await performTokenExchange({req, res, next, api, config, sessionToken});
}

async function validateWithAuthCodeFlow({
  req,
  res,
  next,
  api,
  config,
}: StrategyParams): Promise<unknown> {
  let sessionId: string | undefined;
  try {
    sessionId = await api.session.getCurrentId({
      isOnline: config.useOnlineTokens,
      rawRequest: req,
      rawResponse: res,
    });
  } catch (error) {
    config.logger.error(`Error when loading session from storage: ${error}`);

    handleSessionError(req, res, error);
    return undefined;
  }

  let session: Session | undefined;
  if (sessionId) {
    try {
      session = await config.sessionStorage.loadSession(sessionId);
    } catch (error) {
      config.logger.error(`Error when loading session from storage: ${error}`);

      res.status(500);
      res.send(error.message);
      return undefined;
    }
  }

  let shop = api.utils.sanitizeShop(req.query.shop as string) || session?.shop;

  if (
    session &&
    !config.useOnlineTokens &&
    config.future?.expiringOfflineAccessTokens
  ) {
    try {
      session = await ensureOfflineTokenIsNotExpired({api, config}, session);
    } catch (error) {
      config.logger.error(`Failed to refresh offline access token: ${error}`, {
        shop: session.shop,
      });
    }
  }

  if (session && shop && session.shop !== shop) {
    config.logger.debug('Found a session for a different shop in the request', {
      currentShop: session.shop,
      requestShop: shop,
    });

    return redirectToAuth({req, res, api, config});
  }

  if (session) {
    config.logger.debug('Request session found and loaded', {
      shop: session.shop,
    });

    if (session.isActive(api.config.scopes)) {
      config.logger.debug('Request session exists and is active', {
        shop: session.shop,
      });

      let hasValidToken: boolean;
      try {
        hasValidToken = await hasValidAccessToken(api, session);
      } catch (error) {
        config.logger.error(`Could not check if session was valid: ${error}`, {
          shop: session.shop,
        });
        hasValidToken = false;
      }

      if (hasValidToken) {
        config.logger.debug('Request session has a valid access token', {
          shop: session.shop,
        });

        res.locals.shopify = {
          ...res.locals.shopify,
          session,
        };
        return next();
      }
    }
  }

  const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
  if (bearerPresent) {
    if (!shop) {
      shop = await setShopFromSessionOrToken(api, session, bearerPresent[1]);
    }
  }

  const redirectUri = `${config.auth.path}?shop=${shop}`;
  config.logger.info(`Session was not valid. Redirecting to ${redirectUri}`, {
    shop,
  });

  return redirectOutOfApp({api, config})({
    req,
    res,
    redirectUri,
    shop: shop!,
  });
}

function handleSessionError(_req: Request, res: Response, error: Error) {
  switch (true) {
    case error instanceof InvalidJwtError:
      res.status(401);
      res.send(error.message);
      break;
    default:
      res.status(500);
      res.send(error.message);
      break;
  }
}

async function setShopFromSessionOrToken(
  api: Shopify,
  session: Session | undefined,
  token: string,
): Promise<string | undefined> {
  let shop: string | undefined;

  if (session) {
    shop = session.shop;
  } else if (api.config.isEmbeddedApp) {
    const payload = await api.session.decodeSessionToken(token);
    shop = payload.dest.replace('https://', '');
  }
  return shop;
}
