import {BasicParams} from '../types';

import {createOrLoadOfflineSession} from './create-or-load-offline-session';
import {ensureOfflineTokenIsNotExpired} from './ensure-offline-token-is-not-expired';

export async function getOfflineSession(params: BasicParams, shop: string) {
  const session = await createOrLoadOfflineSession(shop, params);

  if (!session) return undefined;

  return ensureOfflineTokenIsNotExpired(session, params, shop);
}
