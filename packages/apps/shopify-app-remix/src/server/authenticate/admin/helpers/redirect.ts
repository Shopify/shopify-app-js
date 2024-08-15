import {
  TypedResponse,
  redirect as remixRedirect,
} from '@remix-run/server-runtime';

import {BasicParams} from '../../../types';
import {getSessionTokenHeader} from '../../helpers/get-session-token-header';

import {renderAppBridge} from './render-app-bridge';
import {redirectWithAppBridgeHeaders} from './redirect-with-app-bridge-headers';

export type RedirectTarget = '_self' | '_parent' | '_top' | '_blank';
export type RedirectInit = number | (ResponseInit & {target?: RedirectTarget});
export type RedirectFunction = (
  url: string,
  init?: RedirectInit,
) => TypedResponse<never>;

export function redirectFactory(
  params: BasicParams,
  request: Request,
  shop: string,
): RedirectFunction {
  const {config, logger} = params;

  return function redirect(url, init: RedirectInit) {
    const {searchParams} = new URL(request.url);
    const parsedUrl = parseURL(url, config.appUrl, shop);

    logger.debug('Redirecting', {url: parsedUrl.toString()});

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
  const isGet = request.method === 'GET';
  const sessionTokenHeader = Boolean(getSessionTokenHeader(request));

  return (
    sessionTokenHeader &&
    !isBounceRequest(request) &&
    (!isEmbeddedRequest(request) || !isGet)
  );
}

function isEmbeddedRequest(request: Request) {
  const {searchParams} = new URL(request.url);

  return searchParams.get('embedded') === '1';
}

function parseURL(url: string, base: string, shop: string) {
  if (isAdminRemotePath(url)) {
    const adminPath = getAdminRemotePath(url);
    const cleanShopName = shop.replace('.myshopify.com', '');
    return new URL(
      `https://admin.shopify.com/store/${cleanShopName}${adminPath}`,
    );
  } else {
    return new URL(url, base);
  }
}

const ADMIN_REGEX = /^shopify:\/*admin\//i;

function isAdminRemotePath(url: string) {
  return ADMIN_REGEX.test(url);
}

function getAdminRemotePath(url: string | URL) {
  const parsedUrl = removeRestrictedParams(new URL(url)).href;
  return parsedUrl.replace(ADMIN_REGEX, '/');
}

const embeddedFrameParamsToRemove = [
  'hmac',
  'locale',
  'protocol',
  'session',
  'id_token',
  'shop',
  'timestamp',
  'host',
  'embedded',
  // sent when clicking rel="home" nav item
  'appLoadId',
];

function removeRestrictedParams(url: URL | string) {
  const newUrl = new URL(url);
  embeddedFrameParamsToRemove.forEach((param) =>
    newUrl.searchParams.delete(param),
  );
  return newUrl;
}
