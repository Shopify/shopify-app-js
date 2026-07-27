import {Session} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

export async function loadOfflineSession(
  {api, config}: ApiAndConfigParams,
  shop: string,
): Promise<Session | undefined> {
  config.logger.debug('Loading offline session from session storage', {shop});

  const offlineSessionId = api.session.getOfflineId(shop);
  return config.sessionStorage.loadSession(offlineSessionId);
}
