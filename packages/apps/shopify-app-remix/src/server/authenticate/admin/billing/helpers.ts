import {redirect} from '@remix-run/server-runtime';

import {BasicParams} from '../../../types';
import {getAppBridgeHeaders} from '../helpers';

export function redirectOutOfApp(
  params: BasicParams,
  request: Request,
  url: string,
  shop: string,
): never {
  const {config, logger} = params;

  logger.debug('Redirecting out of app', {shop, url});

  const requestUrl = new URL(request.url);
  const isEmbeddedRequest = requestUrl.searchParams.get('embedded') === '1';
  const isXhrRequest = request.headers.get('authorization');

  if (isXhrRequest) {
    // eslint-disable-next-line no-warning-comments
    // TODO Check this with the beta flag disabled (with the bounce page)
    // Remix is not including the X-Shopify-API-Request-Failure-Reauthorize-Url when throwing a Response
    // https://github.com/remix-run/remix/issues/5356
    throw new Response(undefined, {
      status: 401,
      statusText: 'Unauthorized',
      headers: getAppBridgeHeaders(url),
    });
  } else if (isEmbeddedRequest) {
    const params = new URLSearchParams({
      shop,
      host: requestUrl.searchParams.get('host')!,
      exitIframe: url,
    });

    throw redirect(`${config.auth.exitIframePath}?${params.toString()}`);
  } else {
    // This will only ever happen for non-embedded apps, because the authenticator will stop before reaching this point
    throw redirect(url);
  }
}
