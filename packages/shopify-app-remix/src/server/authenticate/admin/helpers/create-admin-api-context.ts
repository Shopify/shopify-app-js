import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {AdminApiContext, adminClientFactory} from '../../../clients/admin';

import {handleClientErrorFactory} from './handle-client-error';

export function createAdminApiContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(
  request: Request,
  session: Session,
  params: BasicParams,
): AdminApiContext<Resources> {
  return adminClientFactory<Resources>({
    session,
    params,
    handleClientError: handleClientErrorFactory({
      request,
    }),
  });
}
