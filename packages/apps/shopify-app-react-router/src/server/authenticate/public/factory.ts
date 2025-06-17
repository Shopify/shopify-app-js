
import {BasicParams} from '../../types';

import {authenticateCheckoutFactory} from './checkout/authenticate';
import {authenticateAppProxyFactory} from './appProxy/authenticate';
import {authenticateCustomerAccountFactory} from './customer-account/authenticate';
import {AuthenticatePublic} from './types';
import {authenticatePOSFactory} from './pos/authenticate';

export function authenticatePublicFactory(params: BasicParams) {
  const authenticateCheckout = authenticateCheckoutFactory(params);
  const authenticateAppProxy = authenticateAppProxyFactory(params);
  const authenticateCustomerAccount =
    authenticateCustomerAccountFactory(params);
  const authenticatePOS = authenticatePOSFactory(params);

  const context: AuthenticatePublic = {
    checkout: authenticateCheckout,
    appProxy: authenticateAppProxy,
    customerAccount: authenticateCustomerAccount,
    pos: authenticatePOS,
  };

  return context;
}
