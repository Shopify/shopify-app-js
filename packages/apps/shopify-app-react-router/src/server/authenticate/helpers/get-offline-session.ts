import {BasicParams} from '../../types';
import {createOrLoadOfflineSession} from './create-or-load-offline-session';
import {ensureOfflineTokenIsFresh} from './ensure-offline-token-is-fresh';

export async function getOfflineSession(
  params: BasicParams,
  shop: string,
  request?: Request,
) {
  const session = await createOrLoadOfflineSession(shop, params);

  if (!session) return undefined;

  return await ensureOfflineTokenIsFresh(session, params, shop, request);
}
