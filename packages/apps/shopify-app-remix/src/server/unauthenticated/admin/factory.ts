import {ShopifyRestResources} from '@shopify/shopify-api';

import {createOrLoadOfflineSession} from '../../authenticate/helpers/create-or-load-offline-session';
import {SessionNotFoundError} from '../../errors';
import {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients/admin';

import {UnauthenticatedAdminContext} from './types';

export function unauthenticatedAdminContextFactory<
  Resources extends ShopifyRestResources,
>(params: BasicParams) {
  return async (
    shop: string,
  ): Promise<UnauthenticatedAdminContext<Resources>> => {
    const session = await createOrLoadOfflineSession(shop, params);

    if (!session) {
      throw new SessionNotFoundError(
        `Could not find a session for shop ${shop} when creating unauthenticated admin context`,
      );
    }

    return {
      session,
      admin: adminClientFactory<Resources>({params, session}),
    };
  };
}
