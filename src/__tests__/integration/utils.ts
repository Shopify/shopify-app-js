import crypto from 'crypto';

import request from 'supertest';

import {BASE64_HOST} from '../test-helper';

import {CallbackInfo, CookiesType} from './types';

export function convertBeginResponseToCallbackInfo(
  beginResponse: request.Response,
  secret: string,
  shop: string,
): CallbackInfo {
  const cookies: CookiesType = beginResponse.headers['set-cookie'].reduce(
    (acc: CookiesType, cookie: string) => {
      const [name, ...rest] = cookie.split(';')[0].split('=');
      const value = rest.join('=');

      acc[name] = value;
      return acc;
    },
    {},
  );

  const params = new URLSearchParams({
    code: 'testCode',
    host: BASE64_HOST,
    shop,
    state: cookies.shopify_app_state,
    timestamp: '123',
  });
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(params.toString(), 'utf8')
    .digest('hex');
  params.append('hmac', hmac);

  const cookiesArray = Object.entries(cookies).map(
    ([name, value]: [string, string]) => `${name}=${value}`,
  );

  return {
    params,
    cookies: cookiesArray,
  };
}
