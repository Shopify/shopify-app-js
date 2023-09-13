import {BasicParams} from 'src/server/types';
import {ShopifyError} from '@shopify/shopify-api';

import {storefrontClientFactory} from '../../clients/storefront';
import {getOfflineSession} from '../helpers';

import {StorefrontContext, GetStorefrontContext} from './types';

export function unauthenticatedStorefrontContextFactory(
  params: BasicParams,
): GetStorefrontContext {
  return async (shop: string): Promise<StorefrontContext> => {
    const session = await getOfflineSession(shop, params);

    if (!session) {
      throw new ShopifyError(
        `Could not find a session for shop ${shop} when creating unauthenticated admin context`,
      );
    }

    return {
      graphql: storefrontClientFactory({params, session}),
    };
  };
}
