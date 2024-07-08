import {Session} from '@shopify/shopify-api';

import {loadSession} from '../../authenticate/helpers/load-session';
import {BasicParams} from '../../types';

export async function getOfflineSession(
  shop: string,
  params: BasicParams,
): Promise<Session | undefined> {
  const session = await loadSession(shop, params);

  return session;
}
