import {BasicParams} from 'src/server/types';
import {ShopifyError} from '@shopify/shopify-api';

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
      throw new ShopifyError(
        `Could not find a session for shop ${shop} when creating unauthenticated admin context`,
      );
    }

    return {
      session,
      storefront: storefrontClientFactory({params, session}),
    };
  };
}
