import {shopifyApp} from '../shopify-app';

import {APP_URL} from './const';
import {getJwt} from './get-jwt';
import {setUpValidSession} from './setup-valid-session';
import {testConfig} from './test-config';

export async function setUpFetchFlow() {
  const shopify = shopifyApp(testConfig());

  await setUpValidSession(shopify.sessionStorage);

  const {token} = getJwt();
  const request = new Request(APP_URL, {
    headers: {Authorization: `Bearer ${token}`},
  });

  const result = await shopify.authenticate.admin(request);

  return {
    shopify,
    ...result,
  };
}
