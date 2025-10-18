import {Session} from '@shopify/shopify-api';
import {AppDistribution, BasicParams} from '../../types';
import {createTokenExchangeStrategy} from '../admin/strategies/token-exchange';
import {
  getSessionTokenFromUrlParam,
  getSessionTokenHeader,
} from './get-session-token-header';

export async function ensureOfflineTokenIsFresh(
  session: Session,
  params: BasicParams,
  shop: string,
  request?: Request,
) {
  const {config} = params;
  if (
    config.future?.unstable_expiringOfflineAccessTokenSupport &&
    !session.isActive(undefined) &&
    config.distribution === AppDistribution.ShopifyAdmin
  ) {
    const tokenExchangeStrategy = createTokenExchangeStrategy(params);

    const offlineSession = await tokenExchangeStrategy.refreshToken(
      shop,
      request,
      getSessionToken(request),
      session.refreshToken,
    );

    await config.sessionStorage!.storeSession(offlineSession);
    return offlineSession;
  }
  return session;
}

function getSessionToken(request?: Request) {
  if (!request) return undefined;
  return (getSessionTokenHeader(request) ||
    getSessionTokenFromUrlParam(request))!;
}
