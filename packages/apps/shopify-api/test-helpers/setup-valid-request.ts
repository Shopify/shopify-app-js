import {HashFormat, createSHA256HMAC} from '../runtime/crypto';

import {getShopValue} from './get-shop-value';
import {getHostValue} from './get-host-value';
import {getJwt} from './get-jwt';
import {getHmac} from './get-hmac';

export enum RequestType {
  Admin,
  Bearer,
  Extension,
  Public,
}

interface ValidBaseRequestOptions {
  type: RequestType.Admin | RequestType.Bearer;
  store: string;
  apiSecretKey: string;
  apiKey: string;
}

interface ValidExtensionRequestOptions {
  type: RequestType.Extension;
  store: string;
  apiSecretKey: string;
  body?: any;
  headers?: Record<string, string>;
}

interface ValidPublicRequestOptions {
  type: RequestType.Public;
  store: string;
  apiSecretKey: string;
}

export type ValidRequestOptions =
  | ValidBaseRequestOptions
  | ValidExtensionRequestOptions
  | ValidPublicRequestOptions;

/**
 * Duplicates a Request object and decorates the duplicated object with fake authorization headers or query string parameters.
 *
 * @param {ValidRequestOptions} options Provides the type of authorization method to fake for the provided Request, and the inputs required to fake the authorization.
 * @param {Request} request The Request object to be decorated with fake authorization headers or query string parameters.
 * @returns {Request} A duplicate of the provided Request object with faked authorization headers or query string parameters.
 */
export async function setUpValidRequest(
  options: ValidRequestOptions,
  request: Request,
) {
  let authenticatedRequest: Request;
  switch (options.type) {
    case RequestType.Admin:
      authenticatedRequest = await adminRequest(
        request,
        options.store,
        options.apiKey,
        options.apiSecretKey,
      );
      break;
    case RequestType.Bearer:
      authenticatedRequest = await bearerRequest(
        request,
        options.store,
        options.apiKey,
        options.apiSecretKey,
      );
      break;
    case RequestType.Extension:
      authenticatedRequest = extensionRequest(
        request,
        options.store,
        options.apiSecretKey,
        options.body,
        options.headers,
      );
      break;
    case RequestType.Public:
      authenticatedRequest = await publicRequest(
        request,
        options.store,
        options.apiSecretKey,
      );
      break;
  }

  return authenticatedRequest;
}

async function adminRequest(
  request: Request,
  store: string,
  apiKey: string,
  apiSecretKey: string,
) {
  const {token} = await getJwt(store, apiKey, apiSecretKey);

  const url = new URL(request.url);
  url.searchParams.set('embedded', '1');
  url.searchParams.set('shop', getShopValue(store));
  url.searchParams.set('host', getHostValue(store));
  url.searchParams.set('id_token', token);
  return new Request(url.href, request);
}

async function bearerRequest(
  request: Request,
  store: string,
  apiKey: string,
  apiSecretKey: string,
) {
  const {token} = await getJwt(store, apiKey, apiSecretKey);

  const authenticatedRequest = new Request(request);
  authenticatedRequest.headers.set('authorization', `Bearer ${token}`);

  return authenticatedRequest;
}

function extensionRequest(
  request: Request,
  store: string,
  apiSecretKey: string,
  body: any,
  headers?: Record<string, string>,
) {
  const bodyString = JSON.stringify(body);

  const authenticatedRequest = new Request(request, {
    method: 'POST',
    body: bodyString,
  });
  authenticatedRequest.headers.set(
    'X-Shopify-Hmac-Sha256',
    getHmac(bodyString, apiSecretKey),
  );
  authenticatedRequest.headers.set(
    'X-Shopify-Shop-Domain',
    getShopValue(store),
  );
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      authenticatedRequest.headers.set(key, value);
    }
  }

  return authenticatedRequest;
}

async function publicRequest(
  request: Request,
  store: string,
  apiSecretKey: string,
) {
  const url = new URL(request.url);
  url.searchParams.set('shop', getShopValue(store));
  url.searchParams.set('timestamp', String(Math.trunc(Date.now() / 1000) - 1));

  const params = Object.fromEntries(url.searchParams.entries());
  const string = Object.entries(params)
    .sort(([val1], [val2]) => val1.localeCompare(val2))
    .reduce((acc, [key, value]) => {
      return `${acc}${key}=${value}`;
    }, '');

  url.searchParams.set(
    'signature',
    await createSHA256HMAC(apiSecretKey, string, HashFormat.Hex),
  );

  return new Request(url.href, request);
}
