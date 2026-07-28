import {Session, ShopifyError} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

import {ensureOfflineTokenIsNotExpired} from './ensure-offline-token-is-not-expired';
import {loadOfflineSession} from './load-offline-session';

export async function ensureValidOfflineSession(
  params: ApiAndConfigParams,
  shop: string,
): Promise<Session | undefined> {
  const {config} = params;

  if (!config.future?.expiringOfflineAccessTokens) {
    throw new ShopifyError(
      'ensureValidOfflineSession requires the `expiringOfflineAccessTokens` future flag to be enabled.',
    );
  }

  const session = await loadOfflineSession(params, shop);

  if (!session) return undefined;

  return ensureOfflineTokenIsNotExpired(params, session);
}
