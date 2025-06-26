import {BasicParams} from '../../types';

import {authenticateCheckoutFactory} from './checkout/authenticate';
import {authenticateAppProxyFactory} from './appProxy/authenticate';
import {authenticateCustomerAccountFactory} from './customer-account/authenticate';
import {AuthenticatePublic} from './types';

export function authenticatePublicFactory(params: BasicParams) {
  const authenticateCheckout = authenticateCheckoutFactory(params);
  const authenticateAppProxy = authenticateAppProxyFactory(params);
  const authenticateCustomerAccount =
    authenticateCustomerAccountFactory(params);

  const context: AuthenticatePublic = {
    checkout: authenticateCheckout,
    appProxy: authenticateAppProxy,
    customerAccount: authenticateCustomerAccount,
  };

  return context;
}
