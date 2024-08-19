import {
  RequestType,
  ValidRequestOptions as ValidRequestOptionsImport,
  setUpValidRequest as setUpValidRequestImport,
} from '@shopify/shopify-api/test-helpers';

import {ShopifyApp} from '../types';

import {API_KEY, API_SECRET_KEY, APP_URL, TEST_SHOP_NAME} from './const';
import {setUpValidSession} from './setup-valid-session';

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

  let decoratedOptions: ValidRequestOptionsImport;
  switch (options.type) {
    case RequestType.Admin:
      decoratedOptions = {
        store: TEST_SHOP_NAME,
        apiKey: API_KEY,
        apiSecretKey: API_SECRET_KEY,
        ...options,
      };
      break;
    case RequestType.Bearer:
      decoratedOptions = {
        store: TEST_SHOP_NAME,
        apiKey: API_KEY,
        apiSecretKey: API_SECRET_KEY,
        ...options,
      };
      break;
    case RequestType.Extension:
      decoratedOptions = {
        store: TEST_SHOP_NAME,
        apiSecretKey: API_SECRET_KEY,
        ...options,
      };
      break;
    case RequestType.Public:
      decoratedOptions = {
        store: TEST_SHOP_NAME,
        apiSecretKey: API_SECRET_KEY,
        ...options,
        type: options.type,
      };
      break;
  }

  const url = new URL(APP_URL);
  const request: Request = await setUpValidRequestImport(
    decoratedOptions,
    new Request(url),
  );

  return {shopify, session, request};
}

export {RequestType};
