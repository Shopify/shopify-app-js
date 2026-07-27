import {Session} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

import {ensureOfflineTokenIsNotExpired} from './ensure-offline-token-is-not-expired';
import {loadOfflineSession} from './load-offline-session';

export async function ensureValidOfflineSession(
  params: ApiAndConfigParams,
  shop: string,
): Promise<Session | undefined> {
  const session = await loadOfflineSession(params, shop);

  if (!session) return undefined;

  return ensureOfflineTokenIsNotExpired(params, session);
}
