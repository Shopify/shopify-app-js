import {SessionNotFoundError} from '../../errors';
import {BasicParams} from '../../types';
import {storefrontClientFactory} from '../../clients/storefront';
import {getOfflineSession} from '../helpers';

import {
  UnauthenticatedStorefrontContext,
  GetUnauthenticatedStorefrontContext,
} from './types';

export function unauthenticatedStorefrontContextFactory(
  params: BasicParams,
): GetUnauthenticatedStorefrontContext {
  return async (shop: string): Promise<UnauthenticatedStorefrontContext> => {
    const session = await getOfflineSession(shop, params);

    if (!session) {
      throw new SessionNotFoundError(
        `Could not find a session for shop ${shop} when creating unauthenticated storefront context`,
      );
    }

    return {
      session,
      storefront: storefrontClientFactory({params, session}),
    };
  };
}
