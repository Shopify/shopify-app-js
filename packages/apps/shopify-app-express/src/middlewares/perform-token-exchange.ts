import {
  HttpResponseError,
  InvalidJwtError,
  RequestedTokenType,
  Session,
  Shopify,
} from '@shopify/shopify-api';
import {Request, Response, NextFunction} from 'express';

import {AppConfigInterface} from '../config-types';
import {WITHIN_MILLISECONDS_OF_EXPIRY} from '../helpers/ensure-offline-token-is-not-expired';

interface PerformTokenExchangeParams {
  req: Request;
  res: Response;
  next: NextFunction;
  api: Shopify;
  config: AppConfigInterface;
  sessionToken: string;
}

export async function performTokenExchange({
  req: _req,
  res,
  next,
  api,
  config,
  sessionToken,
}: PerformTokenExchangeParams): Promise<void> {
  const logger = config.logger;

  try {
    const payload = await api.session.decodeSessionToken(sessionToken);
    const shop = payload.dest.replace('https://', '');
    const sub = payload.sub;

    // Load the relevant session based on online/offline mode
    let sessionId: string;
    if (config.useOnlineTokens) {
      sessionId = api.session.getJwtSessionId(shop, sub);
    } else {
      sessionId = api.session.getOfflineId(shop);
    }

    let session: Session | undefined;
    try {
      session = await config.sessionStorage.loadSession(sessionId);
    } catch (error) {
      logger.error(`Error when loading session from storage: ${error}`);
      res.status(500);
      res.send(error.message);
      return;
    }

    // If session exists and is active (not within 5 min of expiry), use it
    if (session && session.isActive(undefined, WITHIN_MILLISECONDS_OF_EXPIRY)) {
      logger.debug('Request is valid, session is active', {
        shop: session.shop,
      });

      res.locals.shopify = {
        ...res.locals.shopify,
        session,
      };
      next();
      return;
    }

    // No valid session — perform token exchange
    logger.info('No valid session found', {shop});

    // Always exchange offline first
    logger.info('Requesting offline access token', {shop});
    const {session: offlineSession} = await api.auth.tokenExchange({
      sessionToken,
      shop,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
      expiring: config.future?.expiringOfflineAccessTokens,
    });
    await config.sessionStorage.storeSession(offlineSession);

    let newSession = offlineSession;

    // If using online tokens, also exchange for an online token
    if (config.useOnlineTokens) {
      logger.info('Requesting online access token', {shop});
      const {session: onlineSession} = await api.auth.tokenExchange({
        sessionToken,
        shop,
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
        expiring: config.future?.expiringOfflineAccessTokens,
      });
      await config.sessionStorage.storeSession(onlineSession);
      newSession = onlineSession;
    }

    logger.debug('Request is valid, loaded session from session token', {
      shop: newSession.shop,
      isOnline: newSession.isOnline,
    });

    // Call afterAuth hook (idempotent — only once per session token)
    try {
      await config.idempotentPromiseHandler.handlePromise({
        promiseFunction: async () => {
          await config.hooks?.afterAuth?.({session: newSession});
        },
        identifier: sessionToken,
      });
    } catch (error) {
      logger.error(`Error in afterAuth hook: ${error}`);
      res.status(500);
      res.send('Internal Server Error');
      return;
    }

    res.locals.shopify = {
      ...res.locals.shopify,
      session: newSession,
    };
    next();
  } catch (error) {
    if (
      error instanceof InvalidJwtError ||
      (error instanceof HttpResponseError &&
        error.response.code === 400 &&
        error.response.body?.error === 'invalid_subject_token')
    ) {
      res.status(401);
      res.send(error.message);
      return;
    }

    if (error instanceof HttpResponseError && error.response.code === 401) {
      // Invalidate the access token by clearing it and re-storing
      logger.debug('Responding to invalid access token');
      res.status(401);
      res.send(error.message);
      return;
    }

    logger.error(`Unexpected error during token exchange: ${error}`);
    res.status(500);
    res.send('Internal Server Error');
  }
}
