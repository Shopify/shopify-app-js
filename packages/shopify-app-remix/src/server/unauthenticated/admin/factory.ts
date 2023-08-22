import {ShopifyError, ShopifyRestResources} from '@shopify/shopify-api';

import {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients/admin';

import {UnauthenticatedAdminContext} from './types';

export function unauthenticatedAdminContextFactory<
  Resources extends ShopifyRestResources,
>(params: BasicParams) {
  return async (
    shop: string,
  ): Promise<UnauthenticatedAdminContext<Resources>> => {
    const offlineSessionId = params.api.session.getOfflineId(shop);
    const session = await params.config.sessionStorage.loadSession(
      offlineSessionId,
    );

    if (!session) {
      throw new ShopifyError(
        `Could not find a session for shop ${shop} when creating unauthenticated admin context`,
      );
    }

    return {
      session,
      admin: adminClientFactory<Resources>({params, session}),
    };
  };
}
