import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';

import {shopifyApp} from '../shopify-app';

import {APP_URL, BASE64_HOST, TEST_SHOP} from './const';
import {getJwt} from './get-jwt';
import {setUpValidSession} from './setup-valid-session';
import {testConfig} from './test-config';

export async function setUpEmbeddedFlow() {
  const shopify = shopifyApp(
    testConfig({
      future: {unstable_newEmbeddedAuthStrategy: false},
      restResources,
    }),
  );
  const expectedSession = await setUpValidSession(shopify.sessionStorage);

  const {token} = getJwt();
  const request = new Request(
    `${APP_URL}?embedded=1&shop=${TEST_SHOP}&host=${BASE64_HOST}&id_token=${token}`,
  );

  return {
    shopify,
    expectedSession,
    ...(await shopify.authenticate.admin(request)),
    request,
  };
}
