import {
  TypedResponse,
  redirect as remixRedirect,
} from '@remix-run/server-runtime';

import {BasicParams} from '../../../types';
import {getSessionTokenHeader} from '../../helpers/get-session-token-header';

import {renderAppBridge} from './render-app-bridge';
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
    const {searchParams} = new URL(request.url);
    const parsedUrl = new URL(url, config.appUrl);

    const isSameOrigin = parsedUrl.origin === config.appUrl;
    if (isSameOrigin || url.startsWith('/')) {
      searchParams.forEach((value, key) => {
        if (!parsedUrl.searchParams.has(key)) {
          parsedUrl.searchParams.set(key, value);
        }
      });
    }

    const target = (typeof init !== 'number' && init?.target) || '_self';
    if (target === '_self') {
      if (isBounceRequest(request)) {
        throw renderAppBridge(params, request, {
          url: parsedUrl.toString(),
          target,
        });
      } else {
        return remixRedirect(parsedUrl.toString(), init);
      }
    } else if (isDataRequest(request)) {
      throw redirectWithAppBridgeHeaders(parsedUrl.toString());
    } else if (isEmbeddedRequest(request)) {
      throw renderAppBridge(params, request, {
        url: parsedUrl.toString(),
        target,
      });
    }

    return remixRedirect(url, init);
  };
}

function isBounceRequest(request: Request) {
  return (
    Boolean(getSessionTokenHeader(request)) &&
    request.headers.has('X-Shopify-Bounce')
  );
}

function isDataRequest(request: Request) {
  const {searchParams} = new URL(request.url);

  const isGet = request.method === 'GET';
  const sessionTokenHeader = Boolean(getSessionTokenHeader(request));
  const sessionTokenSearchParam = searchParams.has('id_token');

  return (
    sessionTokenHeader &&
    !sessionTokenSearchParam &&
    !isBounceRequest(request) &&
    (!isEmbeddedRequest(request) || !isGet)
  );
}

function isEmbeddedRequest(request: Request) {
  const {searchParams} = new URL(request.url);

  return searchParams.get('embedded') === '1';
}
