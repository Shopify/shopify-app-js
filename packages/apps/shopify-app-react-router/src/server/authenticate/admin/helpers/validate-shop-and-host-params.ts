import {BasicParams, AppDistribution} from '../../../types';

import {renderAppBridge} from './render-app-bridge';

export function validateShopAndHostParams(
  params: BasicParams,
  request: Request,
) {
  const {api, config, logger} = params;

  if (config.distribution !== AppDistribution.ShopifyAdmin) {
    const url = new URL(request.url);
    const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
    if (!shop) {
      logger.debug('Missing or invalid shop, rendering App Bridge', {
        shop,
      });
      throw renderAppBridgeOrError(request, params);
    }

    const host = api.utils.sanitizeHost(url.searchParams.get('host')!);
    if (!host) {
      logger.debug('Invalid host, rendering App Bridge', {
        shop,
        host: url.searchParams.get('host'),
      });
      throw renderAppBridgeOrError(request, params);
    }
  }
}

function renderAppBridgeOrError(request: Request, params: BasicParams): never {
  const {config, logger} = params;

  const {pathname} = new URL(request.url);
  if (pathname.endsWith(config.auth.loginPath)) {
    const message =
      `Detected call to shopify.authenticate.admin() from configured login path ` +
      `('${config.auth.loginPath}'), please make sure to call shopify.login() from that route instead.`;

    logger.debug(message);
    throw new Response(message, {status: 500});
  }

  logger.debug(
    'Missing shop or host params, rendering App Bridge to retrieve session',
  );
  throw renderAppBridge(params, request);
}
