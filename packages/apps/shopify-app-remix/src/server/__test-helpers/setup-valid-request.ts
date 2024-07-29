import {HashFormat, createSHA256HMAC} from '@shopify/shopify-api/runtime';

import {ShopifyApp} from '../types';

import {API_SECRET_KEY, APP_URL, BASE64_HOST, TEST_SHOP} from './const';
import {setUpValidSession} from './setup-valid-session';
import {getJwt} from './get-jwt';
import {getHmac} from './get-hmac';

export enum RequestType {
  Admin,
  Bearer,
  Extension,
  Public,
}

interface ValidBaseRequestOptions {
  type: RequestType.Admin | RequestType.Bearer | RequestType.Public;
}

interface ValidExtensionRequestOptions {
  type: RequestType.Extension;
  body?: any;
  headers?: Record<string, string>;
}

type ValidRequestOptions =
  | ValidBaseRequestOptions
  | ValidExtensionRequestOptions;

export async function setupValidRequest(
  shopify: ShopifyApp<any>,
  options: ValidRequestOptions,
) {
  const session = await setUpValidSession(shopify.sessionStorage, {
    isOnline: false,
  });

  const url = new URL(APP_URL);
  const init: RequestInit = {};

  let request: Request;
  switch (options.type) {
    case RequestType.Admin:
      request = adminRequest(url, init);
      break;
    case RequestType.Bearer:
      request = bearerRequest(url, init);
      break;
    case RequestType.Extension:
      request = extensionRequest(url, init, options.body, options.headers);
      break;
    case RequestType.Public:
      request = await publicRequest(url, init);
      break;
  }

  return {shopify, session, request};
}

function adminRequest(url: URL, init: RequestInit) {
  const {token} = getJwt();

  url.search = new URLSearchParams({
    embedded: '1',
    shop: TEST_SHOP,
    host: BASE64_HOST,
    id_token: token,
  }).toString();
  return new Request(url.href, init);
}

function bearerRequest(url: URL, init: RequestInit) {
  const {token} = getJwt();

  init.headers = {
    authorization: `Bearer ${token}`,
  };

  return new Request(url.href, init);
}

function extensionRequest(
  url: URL,
  init: RequestInit,
  body: any,
  headers?: Record<string, string>,
) {
  const bodyString = JSON.stringify(body);

  init.method = 'POST';
  init.body = bodyString;
  init.headers = {
    'X-Shopify-Hmac-Sha256': getHmac(bodyString),
    'X-Shopify-Shop-Domain': TEST_SHOP,
    ...headers,
  };

  return new Request(url.href, init);
}

async function publicRequest(url: URL, init: RequestInit) {
  url.searchParams.set('shop', TEST_SHOP);
  url.searchParams.set('timestamp', String(Math.trunc(Date.now() / 1000) - 1));

  const params = Object.fromEntries(url.searchParams.entries());
  const string = Object.entries(params)
    .sort(([val1], [val2]) => val1.localeCompare(val2))
    .reduce((acc, [key, value]) => {
      return `${acc}${key}=${value}`;
    }, '');

  url.searchParams.set(
    'signature',
    await createSHA256HMAC(API_SECRET_KEY, string, HashFormat.Hex),
  );

  return new Request(url.href, init);
}
