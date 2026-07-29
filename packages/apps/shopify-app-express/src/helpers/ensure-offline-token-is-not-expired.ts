import {Session} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

import {refreshToken} from './refresh-token';

// 5 minutes
export const WITHIN_MILLISECONDS_OF_EXPIRY = 5 * 60 * 1000;

export async function ensureOfflineTokenIsNotExpired(
  params: ApiAndConfigParams,
  session: Session,
): Promise<Session> {
  const {config} = params;

  if (
    config.future?.expiringOfflineAccessTokens &&
    session.isExpired(WITHIN_MILLISECONDS_OF_EXPIRY) &&
    session.refreshToken
  ) {
    const offlineSession = await refreshToken(
      params,
      session.shop,
      session.refreshToken,
    );

    await config.sessionStorage.storeSession(offlineSession);
    return offlineSession;
  }

  return session;
}
