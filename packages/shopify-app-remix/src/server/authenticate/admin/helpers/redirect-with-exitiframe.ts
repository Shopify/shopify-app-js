import {redirect} from '@remix-run/server-runtime';

import type {BasicParams} from '../../../types';

export function redirectWithExitIframe(
  params: BasicParams,
  request: Request,
  shop: string,
): never {
  const {api, config} = params;
  const url = new URL(request.url);

  const queryParams = url.searchParams;

  const host = api.utils.sanitizeHost(queryParams.get('host')!);

  queryParams.set('shop', shop);

  let destination = `${config.auth.path}?shop=${shop}`;

  if (host) {
    queryParams.set('host', host);
    destination = `${destination}&host=${host}`;
  }
  queryParams.set('exitIframe', destination);

  throw redirect(`${config.auth.exitIframePath}?${queryParams.toString()}`);
}
