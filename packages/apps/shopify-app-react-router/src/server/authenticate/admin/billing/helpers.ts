import {redirect} from 'react-router';

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
