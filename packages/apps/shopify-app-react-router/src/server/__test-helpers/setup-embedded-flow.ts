import {shopifyApp} from '../shopify-app';

import {APP_URL, BASE64_HOST, TEST_SHOP} from './const';
import {getJwt} from './get-jwt';
import {setUpValidSession} from './setup-valid-session';
import {testConfig} from './test-config';

export async function setUpEmbeddedFlow() {
  const shopify = shopifyApp(testConfig());
  const expectedSession = await setUpValidSession(shopify.sessionStorage);

  const {token} = getJwt();
  const request = new Request(
    `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
  );

  const result = await shopify.authenticate.admin(request);

  return {
    shopify,
    expectedSession,
    ...result,
    request,
  };
}
