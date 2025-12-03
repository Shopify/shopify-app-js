import {Session} from '@shopify/shopify-api';

import {AppDistribution, BasicParams} from '../types';

import refreshToken from './refresh-token';

// 5 minutes
export const WITHIN_MILLISECONDS_OF_EXPIRY = 5 * 60 * 1000;

export async function ensureOfflineTokenIsNotExpired(
  session: Session,
  params: BasicParams,
  shop: string,
) {
  const {config} = params;
  if (
    config.future?.expiringOfflineAccessTokens &&
    session.isExpired(WITHIN_MILLISECONDS_OF_EXPIRY) &&
    config.distribution !== AppDistribution.ShopifyAdmin &&
    session.refreshToken
  ) {
    const offlineSession = await refreshToken(
      params,
      shop,
      session.refreshToken,
    );

    await config.sessionStorage!.storeSession(offlineSession);
    return offlineSession;
  }
  return session;
}
