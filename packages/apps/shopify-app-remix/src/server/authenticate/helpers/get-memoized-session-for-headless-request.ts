import {
  InvalidJwtError,
  InvalidShopError,
  Session,
  RequestedTokenType,
} from '@shopify/shopify-api';

import {BasicParams} from '../../types';

import {getSessionTokenHeader} from './get-session-token-header';

export function getMemoizedSessionForHeadlessRequest(
  params: BasicParams,
  request: Request,
) {
  const idToken = getSessionTokenHeader(request);

  if (!idToken) {
    throw new Response(undefined, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }

  const sessionCache: {[key: string]: Session} = {};

  return async () => {
    if (sessionCache[idToken]) {
      return sessionCache[idToken];
    }

    return lookupSession(params, idToken);
  };
}

async function lookupSession(
  params: BasicParams,
  idToken: string,
): Promise<Session> {
  let shop: string;

  try {
    shop = (await params.api.session.decodeSessionToken(idToken)).dest;
  } catch (error) {
    params.logger.error('Unable to decode idToken', {
      idToken,
    });

    throw new Response('', {status: 401});
  }

  const session = await tokenExchangeHeadlessRequest(params, idToken, shop);

  if (!session) {
    params.logger.error(
      'Unable to perform token exchange so unable to perform Admin GraphQL request',
      {
        idToken,
      },
    );

    throw new Response('t', {status: 401});
  }

  return session;
}

async function tokenExchangeHeadlessRequest(
  params: BasicParams,
  idToken: string,
  shop: string,
): Promise<Session | undefined> {
  const {api, config} = params;

  try {
    const {session} = await api.auth.tokenExchange({
      shop,
      sessionToken: idToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
    });

    /**
     * We may be in this code path because the DB has availability issues
     *
     * By catching we prevent the same DB issues from rejecting the request
     * and the Remix action that called this code will still get a session.
     * */
    try {
      await config.sessionStorage!.storeSession(session);
    } catch (error) {
      api.logger.error('Failed to store session after token exchange', {error});
    }

    return session;
  } catch (error) {
    /**
     * InvalidJwtError or InvalidShopError means the request can't be trusted
     * authenticate.something() should reject any request that would trigger
     * a InvalidJwtError or InvalidShopError. So this is just a belts and braces.
     * If any other error is thrown, it's ok, we just can't create a new session.
     * That's ok since we didn't have a session to being with.
     * Think of this as progressive enhancement.
     */
    if (error instanceof InvalidJwtError || error instanceof InvalidShopError) {
      api.logger.error('Webhook validation failed. Invalid JWT', {error});
      throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
    }

    return undefined;
  }
}
