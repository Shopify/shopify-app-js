import type {BasicParams} from '../../types';
import {REAUTH_URL_HEADER} from '../const';

export function redirectWithAppBridgeHeaders(
  params: BasicParams,
  shop: string,
): never {
  const {config} = params;
  const redirectUri = `${config.appUrl}${config.auth.path}?shop=${shop}`;

  throw new Response(undefined, {
    status: 401,
    statusText: 'Unauthorized',
    headers: getAppBridgeHeaders(redirectUri),
  });
}

export function getAppBridgeHeaders(url: string) {
  return new Headers({[REAUTH_URL_HEADER]: url});
}
