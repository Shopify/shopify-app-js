import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import {AppConfigArg} from '../../../config-types';
import type {BasicParams} from '../../../types';
import {
  AdminApiContext,
  HandleAdminClientError,
  adminClientFactory,
} from '../../../clients/admin';

export function createAdminApiContext<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(
  session: Session,
  params: BasicParams,
  handleClientError: HandleAdminClientError,
): AdminApiContext<ConfigArg, Resources> {
  return adminClientFactory<ConfigArg, Resources>({
    session,
    params,
    handleClientError,
  });
}
