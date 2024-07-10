import {Session} from '@shopify/shopify-api';

import {createOrLoadOfflineSession} from '../../authenticate/helpers/create-or-load-offline-session';
import {BasicParams} from '../../types';

export async function getOfflineSession(
  shop: string,
  params: BasicParams,
): Promise<Session | undefined> {
  const session = await createOrLoadOfflineSession(shop, params);

  return session;
}
