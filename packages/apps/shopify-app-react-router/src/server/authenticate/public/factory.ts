import {ShopifyRestResources} from '@shopify/shopify-api';

import {AppConfigArg} from '../../config-types';
import {BasicParams} from '../../types';

import {authenticateCheckoutFactory} from './checkout/authenticate';
import {authenticateAppProxyFactory} from './appProxy/authenticate';
import {authenticateCustomerAccountFactory} from './customer-account/authenticate';
import {AuthenticatePublic} from './types';
import {authenticatePOSFactory} from './pos/authenticate';

export function authenticatePublicFactory<
  ConfigArg extends AppConfigArg,
  Resources extends ShopifyRestResources,
>(params: BasicParams) {
  const authenticateCheckout = authenticateCheckoutFactory(params);
  const authenticateAppProxy = authenticateAppProxyFactory<
    ConfigArg,
    Resources
  >(params);
  const authenticateCustomerAccount =
    authenticateCustomerAccountFactory(params);
  const authenticatePOS = authenticatePOSFactory(params);

  const context: AuthenticatePublic<ConfigArg> = {
    checkout: authenticateCheckout,
    appProxy: authenticateAppProxy,
    customerAccount: authenticateCustomerAccount,
    pos: authenticatePOS,
  };

  return context;
}
