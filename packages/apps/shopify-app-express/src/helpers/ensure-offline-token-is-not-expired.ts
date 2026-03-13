import {Session, Shopify} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';

import refreshToken from './refresh-token';

// 5 minutes
export const WITHIN_MILLISECONDS_OF_EXPIRY = 5 * 60 * 1000;

export async function ensureOfflineTokenIsNotExpired(
  session: Session,
  api: Shopify,
  config: AppConfigInterface,
): Promise<Session> {
  if (
    config.future?.expiringOfflineAccessTokens &&
    session.isExpired(WITHIN_MILLISECONDS_OF_EXPIRY) &&
    session.refreshToken
  ) {
    const offlineSession = await refreshToken(
      api,
      session.shop,
      session.refreshToken,
    );
    await config.sessionStorage.storeSession(offlineSession);
    return offlineSession;
  }
  return session;
}
