import {AppDistribution, BasicParams} from '../../types';

export async function createOrLoadOfflineSession(
  shop: string,
  {api, config, logger}: BasicParams,
) {
  if (config.distribution === AppDistribution.ShopifyAdmin) {
    logger.debug('Creating custom app session from configured access token', {
      shop,
    });
    return api.session.customAppSession(shop);
  } else {
    logger.debug('Loading offline session from session storage', {shop});
    const offlineSessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage!.loadSession(offlineSessionId);

    return session;
  }
}
