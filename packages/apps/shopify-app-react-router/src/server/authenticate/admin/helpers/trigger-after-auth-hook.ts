import {Session, ShopifyRestResources} from '@shopify/shopify-api';

import type {AppConfigArg} from '../../../config-types';
import {AdminApiContextWithRest} from '../../../clients';
import type {BasicParams} from '../../../types';
import {AuthorizationStrategy} from '../strategies/types';

import {createAdminApiContext} from './create-admin-api-context';

export async function triggerAfterAuthHook<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(
  params: BasicParams,
  session: Session,
  request: Request,
  authStrategy: AuthorizationStrategy,
) {
  const {config, logger} = params;
  if (config.hooks.afterAuth) {
    logger.info('Running afterAuth hook', {shop: session.shop});

    const admin = createAdminApiContext<ConfigArg, Resources>(
      session,
      params,
      authStrategy.handleClientError(request),
    ) as AdminApiContextWithRest<Resources>;

    await config.hooks.afterAuth({
      session,
      admin,
    });
  }
}
