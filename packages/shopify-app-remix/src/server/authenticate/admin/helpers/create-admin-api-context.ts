import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {
  AdminApiContext,
  HandleAdminClientError,
  adminClientFactory,
} from '../../../clients/admin';

export function createAdminApiContext<
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(
  session: Session,
  params: BasicParams,
  handleClientError: HandleAdminClientError,
): AdminApiContext<Resources> {
  return adminClientFactory<Resources>({
    session,
    params,
    handleClientError,
  });
}
