import {redirect} from '@remix-run/server-runtime';

import {BasicParams} from '../../../types';

export function validateShopAndHostParams(
  params: BasicParams,
  request: Request,
) {
  const {api, config, logger} = params;

  if (config.isEmbeddedApp) {
    const url = new URL(request.url);
    const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!);
    if (!shop) {
      logger.debug('Missing or invalid shop, redirecting to login path', {
        shop,
      });
      throw redirectToLoginPath(request, params);
    }

    const host = api.utils.sanitizeHost(url.searchParams.get('host')!);
    if (!host) {
      logger.debug('Invalid host, redirecting to login path', {
        host: url.searchParams.get('host'),
      });
      throw redirectToLoginPath(request, params);
    }
  }
}

function redirectToLoginPath(request: Request, params: BasicParams): never {
  const {config, logger} = params;

  const {pathname} = new URL(request.url);
  if (pathname === config.auth.loginPath) {
    const message =
      `Detected call to shopify.authenticate.admin() from configured login path ` +
      `('${config.auth.loginPath}'), please make sure to call shopify.login() from that route instead.`;

    logger.debug(message);
    throw new Response(message, {status: 500});
  }

  throw redirect(config.auth.loginPath);
}
