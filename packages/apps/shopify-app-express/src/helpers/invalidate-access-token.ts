import {Session} from '@shopify/shopify-api';

import {AppConfigInterface} from '../config-types';

export async function invalidateAccessToken(
  session: Session,
  config: AppConfigInterface,
): Promise<void> {
  config.logger.debug('Invalidating stale access token', {shop: session.shop});
  session.accessToken = undefined;
  await config.sessionStorage.storeSession(session);
}
