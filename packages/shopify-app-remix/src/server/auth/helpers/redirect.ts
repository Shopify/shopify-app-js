import {
  TypedResponse,
  redirect as remixRedirect,
} from '@remix-run/server-runtime';

import {BasicParams} from '../../types';

import {renderAppBridge} from './render-app-bridge';
import {getSessionTokenHeader} from './get-session-token-header';
import {redirectWithAppBridgeHeaders} from './redirect-with-app-bridge-headers';

export type RedirectTarget = '_self' | '_parent' | '_top';
export type RedirectInit = number | (ResponseInit & {target?: RedirectTarget});
export type RedirectFunction = (
  url: string,
  init?: RedirectInit,
) => TypedResponse<never>;

export function redirectFactory(
  params: BasicParams,
  request: Request,
): RedirectFunction {
  const {config} = params;

  return function redirect(url, init: RedirectInit) {
    if (config.isEmbeddedApp) {
      const {searchParams} = new URL(request.url);
      const parsedUrl = new URL(url, config.appUrl);
      const target = (typeof init !== 'number' && init?.target) || '_self';

      const isGet = request.method === 'GET';
      const isSameOrigin = parsedUrl.origin === config.appUrl;
      const sessionTokenHeader = Boolean(getSessionTokenHeader(request));
      const sessionTokenSearchParam = searchParams.has('id_token');
      const embeddedSearchParam = searchParams.get('embedded') === '1';

      const isBounceRequest =
        sessionTokenHeader &&
        !sessionTokenSearchParam &&
        embeddedSearchParam &&
        isGet;

      const isDataRequest =
        sessionTokenHeader &&
        !sessionTokenSearchParam &&
        (!embeddedSearchParam || !isGet);

      if (isSameOrigin || url.startsWith('/')) {
        searchParams.forEach((value, key) => {
          if (!parsedUrl.searchParams.has(key)) {
            parsedUrl.searchParams.set(key, value);
          }
        });
      }

      if (target === '_self') {
        if (isBounceRequest) {
          throw renderAppBridge(params, request, {
            url: parsedUrl.toString(),
            target,
          });
        } else {
          return remixRedirect(parsedUrl.toString(), init);
        }
      } else if (isDataRequest) {
        throw redirectWithAppBridgeHeaders(parsedUrl.toString());
      } else if (embeddedSearchParam) {
        throw renderAppBridge(params, request, {
          url: parsedUrl.toString(),
          target,
        });
      }
    }

    return remixRedirect(url, init);
  };
}
