import {ShopifyRestResources} from '@shopify/shopify-api';

import {BasicParams} from '../../types';

import {authenticateCheckoutFactory} from './checkout/authenticate';
import {authenticateAppProxyFactory} from './appProxy/authenticate';
import {authenticateCustomerAccountFactory} from './customer-account/authenticate';
import {AuthenticatePublic} from './types';

export function authenticatePublicFactory<
  Resources extends ShopifyRestResources,
>(params: BasicParams) {
  const authenticateCheckout = authenticateCheckoutFactory(params);
  const authenticateAppProxy = authenticateAppProxyFactory<Resources>(params);
  const authenticateCustomerAccount =
    authenticateCustomerAccountFactory(params);

  const context: AuthenticatePublic = {
    checkout: authenticateCheckout,
    appProxy: authenticateAppProxy,
    customerAccount: authenticateCustomerAccount,
  };

  return context;
}
