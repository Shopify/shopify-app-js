import {redirect} from '@remix-run/server-runtime';
import {Session, ShopifyRestResources, JwtPayload} from '@shopify/shopify-api';

import {AppConfigArg} from '../../../config-types';
import {
  HandleAdminClientError,
  AdminApiContext,
} from '../../../clients/admin/types';
import {adminClientFactory} from '../../../clients/admin';
import type {BasicParams} from '../../../types';
import {BillingContext} from '../billing/types';
import {
  cancelBillingFactory,
  requestBillingFactory,
  requireBillingFactory,
} from '../billing';
import type {
  AdminContext,
  EmbeddedAdminContext,
  NonEmbeddedAdminContext,
} from '../types';
import {EnsureCORSFunction} from '../../helpers';

import {redirectFactory} from './redirect';

interface SessionContext {
  session: Session;
  token?: JwtPayload;
}

export function createApiContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources,
>(
  params: BasicParams,
  request: Request,
  sessionContext: SessionContext,
  cors: EnsureCORSFunction,
  handleAdminClientErrorFactory: HandleClientErrorFactory,
) {
  const context:
    | EmbeddedAdminContext<Config, Resources>
    | NonEmbeddedAdminContext<Config, Resources> = {
    admin: createAdminApiContext<Resources>(
      request,
      sessionContext.session,
      handleAdminClientErrorFactory,
      params,
    ),
    billing: createBillingContext(request, sessionContext.session, params),
    session: sessionContext.session,
    cors,
  };

  const {config} = params;

  if (config.isEmbeddedApp) {
    return {
      ...context,
      sessionToken: sessionContext!.token!,
      redirect: redirectFactory(params, request),
    } as AdminContext<Config, Resources>;
  } else {
    return context as AdminContext<Config, Resources>;
  }
}

type HandleClientErrorFactory = ({
  request,
}: {
  request: Request;
}) => HandleAdminClientError;

export function createAdminApiContext<Resources extends ShopifyRestResources>(
  request: Request,
  session: Session,
  handleClientErrorFactory: HandleClientErrorFactory,
  params: BasicParams,
): AdminApiContext<Resources> {
  const {api, config, logger} = params;
  return adminClientFactory<Resources>({
    session,
    params: {
      api,
      config,
      logger,
    },
    handleClientError: handleClientErrorFactory({request}),
  });
}

export function redirectToBouncePage(
  url: URL,
  basicParams: BasicParams,
): never {
  const {config} = basicParams;

  // Make sure we always point to the configured app URL so it also works behind reverse proxies (that alter the Host
  // header).
  const params = new URLSearchParams(url.search);
  params.delete('id_token');
  params.set(
    'shopify-reload',
    `${config.appUrl}${url.pathname}?${params.toString()}`,
  );

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

export function ensureValidShopParam(
  request: Request,
  basicParams: BasicParams,
): string {
  const url = new URL(request.url);
  const {api} = basicParams;
  const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);

  if (!shop) {
    throw new Response('Shop param is invalid', {
      status: 400,
    });
  }

  return shop;
}

export async function validateUrlParams(
  request: Request,
  basicParams: BasicParams,
) {
  const {api, config, logger} = basicParams;

  if (config.isEmbeddedApp) {
    const url = new URL(request.url);
    const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
    if (!shop) {
      logger.debug('Missing or invalid shop, redirecting to login path', {
        shop,
      });
      throw redirect(config.auth.loginPath);
    }

    const host = api.utils.sanitizeHost(url.searchParams.get('host')!);
    if (!host) {
      logger.debug('Invalid host, redirecting to login path', {
        host: url.searchParams.get('host'),
      });
      throw redirect(config.auth.loginPath);
    }
  }
}

export async function ensureAppIsEmbeddedIfRequired(
  request: Request,
  basicParams: BasicParams,
) {
  const {api, logger} = basicParams;
  const url = new URL(request.url);

  const shop = url.searchParams.get('shop')!;

  if (api.config.isEmbeddedApp && url.searchParams.get('embedded') !== '1') {
    logger.debug('App is not embedded, redirecting to Shopify', {shop});
    await redirectToShopifyOrAppRoot(request, basicParams);
  }
}

export async function redirectToShopifyOrAppRoot(
  request: Request,
  basicParams: BasicParams,
  responseHeaders?: Headers,
): Promise<never> {
  const {api} = basicParams;
  const url = new URL(request.url);

  const host = api.utils.sanitizeHost(url.searchParams.get('host')!)!;
  const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!)!;

  const redirectUrl = api.config.isEmbeddedApp
    ? await api.auth.getEmbeddedAppUrl({rawRequest: request})
    : `/?shop=${shop}&host=${encodeURIComponent(host)}`;

  throw redirect(redirectUrl, {headers: responseHeaders});
}
