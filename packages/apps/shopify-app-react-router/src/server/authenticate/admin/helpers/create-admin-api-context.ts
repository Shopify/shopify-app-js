import {Session} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {
  AdminApiContext,
  HandleAdminClientError,
  adminClientFactory,
} from '../../../clients/admin';

export function createAdminApiContext(
  session: Session,
  params: BasicParams,
  handleClientError: HandleAdminClientError,
): AdminApiContext {
  return adminClientFactory({
    session,
    params,
    handleClientError,
  });
}
