import {REAUTH_URL_HEADER} from '../../const';

export function redirectWithAppBridgeHeaders(redirectUri: string): never {
  throw new Response(undefined, {
    status: 401,
    statusText: 'Unauthorized',
    headers: getAppBridgeHeaders(redirectUri),
  });
}

export function getAppBridgeHeaders(url: string) {
  return new Headers({[REAUTH_URL_HEADER]: url});
}
