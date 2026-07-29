import {Session} from '@shopify/shopify-api';

import {ApiAndConfigParams} from '../types';

export async function refreshToken(
  {api}: ApiAndConfigParams,
  shop: string,
  refreshToken: string,
): Promise<Session> {
  const {session} = await api.auth.refreshToken({
    shop,
    refreshToken,
  });

  return session;
}
