import {Session} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

import {createOrLoadOfflineSession} from './create-or-load-offline-session';
import {ensureOfflineTokenIsNotExpired} from './ensure-offline-token-is-not-expired';

export async function ensureValidOfflineSession(
  params: ApiAndConfigParams,
  shop: string,
): Promise<Session | undefined> {
  const session = await createOrLoadOfflineSession(params, shop);

  if (!session) return undefined;

  return ensureOfflineTokenIsNotExpired(params, session);
}
