import {Session} from '@shopify/shopify-api';

import {AppDistribution, BasicParams} from '../types';

import refreshToken from './refresh-token';

// se if this needs to be moved
const WITHIN_MILLISECONDS_OF_EXPIRY = 1000;

// test if accessible to public use
export async function ensureOfflineTokenIsNotExpired(
  session: Session,
  params: BasicParams,
  shop: string,
) {
  const {config} = params;
  if (
    config.future?.unstable_expiringOfflineAccessTokenSupport &&
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
