import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {AdminApiContext, adminClientFactory} from '../../../clients/admin';
import {AuthorizationStrategy} from '../strategies/types';

import {handleClientErrorFactory} from './handle-client-error';

export function createAdminApiContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(
  request: Request,
  session: Session,
  params: BasicParams,
  authStrategy?: AuthorizationStrategy,
): AdminApiContext<Resources> {
  return adminClientFactory<Resources>({
    session,
    params,
    handleClientError: handleClientErrorFactory({
      request,
      authStrategy,
    }),
  });
}
