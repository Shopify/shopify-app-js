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
import {respondToInvalidSessionToken} from '../helpers/respond-to-invalid-session-token';
import {invalidateAccessToken} from '../helpers/invalidate-access-token';

interface PerformTokenExchangeParams {
  req: Request;
  res: Response;
  next: NextFunction;
  api: Shopify;
  config: AppConfigInterface;
  sessionToken: string;
}

async function exchangeToken(
  api: Shopify,
  config: AppConfigInterface,
  sessionToken: string,
  shop: string,
  requestedTokenType: RequestedTokenType,
): Promise<Session> {
  const {session} = await api.auth.tokenExchange({
    sessionToken,
    shop,
    requestedTokenType,
    expiring: config.future?.expiringOfflineAccessTokens,
  });
  return session;
}

async function callAfterAuthHook(
  config: AppConfigInterface,
  session: Session,
  sessionToken: string,
): Promise<void> {
  await config.idempotentPromiseHandler.handlePromise({
    promiseFunction: async () => {
      await config.hooks?.afterAuth?.({session});
    },
    identifier: sessionToken,
  });
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
  // Hoisted so the outer catch can invalidate a stale access token if needed.
  let sessionToInvalidate: Session | undefined;

  try {
    const payload = await api.session.decodeSessionToken(sessionToken);
    const shop = new URL(payload.dest).hostname;
    const sub = payload.sub;

    const sessionId = config.useOnlineTokens
      ? api.session.getJwtSessionId(shop, sub)
      : api.session.getOfflineId(shop);

    let session: Session | undefined;
    try {
      session = await config.sessionStorage.loadSession(sessionId);
      sessionToInvalidate = session;
    } catch (error) {
      logger.error(`Error when loading session from storage: ${error}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (session && session.isActive(undefined, WITHIN_MILLISECONDS_OF_EXPIRY)) {
      logger.debug('Request is valid, session is active', {shop: session.shop});
      res.locals.shopify = {...res.locals.shopify, session};
      next();
      return;
    }

    logger.info('No valid session found', {shop});
    logger.info('Requesting offline access token', {shop});

    const offlineSession = await exchangeToken(
      api,
      config,
      sessionToken,
      shop,
      RequestedTokenType.OfflineAccessToken,
    );
    await config.sessionStorage.storeSession(offlineSession);

    let newSession = offlineSession;

    if (config.useOnlineTokens) {
      logger.info('Requesting online access token', {shop});
      const onlineSession = await exchangeToken(
        api,
        config,
        sessionToken,
        shop,
        RequestedTokenType.OnlineAccessToken,
      );
      await config.sessionStorage.storeSession(onlineSession);
      newSession = onlineSession;
    }

    logger.debug('Request is valid, loaded session from session token', {
      shop: newSession.shop,
      isOnline: newSession.isOnline,
    });

    try {
      await callAfterAuthHook(config, newSession, sessionToken);
    } catch (error) {
      logger.error(`Error in afterAuth hook: ${error}`);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.locals.shopify = {...res.locals.shopify, session: newSession};
    next();
  } catch (error) {
    if (
      error instanceof InvalidJwtError ||
      (error instanceof HttpResponseError &&
        error.response.code === 400 &&
        error.response.body?.error === 'invalid_subject_token')
    ) {
      respondToInvalidSessionToken(res, error.message, true);
      return;
    }

    if (error instanceof HttpResponseError && error.response.code === 401) {
      if (sessionToInvalidate?.accessToken) {
        await invalidateAccessToken(sessionToInvalidate, config);
      }
      respondToInvalidSessionToken(res, error.message);
      return;
    }

    logger.error(`Unexpected error during token exchange: ${error}`);
    res.status(500).send('Internal Server Error');
  }
}
