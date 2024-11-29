import {
  InvalidJwtError,
  InvalidShopError,
  Session,
  RequestedTokenType,
} from '@shopify/shopify-api';

import {BasicParams} from '../../types';

export async function tokenExchangeHeadlessRequest(
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
