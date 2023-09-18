import {redirect} from '@remix-run/server-runtime';
import {Session, ShopifyRestResources} from '@shopify/shopify-api';
import {adminClientFactory} from 'src/server/clients/admin';
import {AdminApiContext, AppConfigArg} from 'src/server/config-types';

import type {BasicParams} from '../../../types';
import {BillingContext} from '../billing/types';
import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
} from '../billing';

import {handleEmbeddedClientErrorFactory} from '.';

export function createAdminApiContext(
  request: Request,
  session: Session,
  params: BasicParams,
): AdminApiContext<ShopifyRestResources> {
  const {api, config, logger} = params;
  return adminClientFactory<ShopifyRestResources>({
    session,
    params: {
      api,
      config,
      logger,
    },
    handleClientError: handleEmbeddedClientErrorFactory({
      request,
    }),
  });
}

export function redirectToBouncePage(
  url: URL,
  basicParams: BasicParams,
): never {
  const {api, config} = basicParams;

  // eslint-disable-next-line no-warning-comments
  // TODO this is to work around a remix bug
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
  url.protocol = `${api.config.hostScheme}:`;

  const params = new URLSearchParams(url.search);
  params.set('shopify-reload', url.href);

  // eslint-disable-next-line no-warning-comments
  // TODO Make sure this works on chrome without a tunnel (weird HTTPS redirect issue)
  // https://github.com/orgs/Shopify/projects/6899/views/1?pane=issue&itemId=28376650
  throw redirect(`${config.auth.patchSessionTokenPath}?${params.toString()}`);
}

export function createBillingContext(
  request: Request,
  session: Session,
  basicParams: BasicParams,
): BillingContext<AppConfigArg> {
  const {api, logger, config} = basicParams;

  return {
    require: requireBillingFactory({api, logger, config}, request, session),
    request: requestBillingFactory({api, logger, config}, request, session),
    cancel: cancelBillingFactory({api, logger, config}, request, session),
  };
}
