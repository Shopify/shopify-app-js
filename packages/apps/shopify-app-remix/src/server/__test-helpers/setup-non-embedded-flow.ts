import {restResources} from '@shopify/shopify-api/rest/admin/2023-04';
import {SESSION_COOKIE_NAME} from '@shopify/shopify-api';

import {shopifyApp} from '../shopify-app';

import {APP_URL, TEST_SHOP} from './const';
import {setUpValidSession} from './setup-valid-session';
import {signRequestCookie} from './sign-request-cookie';
import {testConfig} from './test-config';

export async function setUpNonEmbeddedFlow() {
  const shopify = shopifyApp(testConfig({restResources, isEmbeddedApp: false}));
  const session = await setUpValidSession(shopify.sessionStorage);

  const request = new Request(`${APP_URL}?shop=${TEST_SHOP}`);
  signRequestCookie({
    request,
    cookieName: SESSION_COOKIE_NAME,
    cookieValue: session.id,
  });

  return {
    shopify,
    ...(await shopify.authenticate.admin(request)),
    request,
    session,
  };
}
