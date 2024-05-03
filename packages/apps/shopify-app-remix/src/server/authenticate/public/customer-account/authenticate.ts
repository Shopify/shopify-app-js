import {BasicParams} from 'src/server/types';

import {authenticateExtensionFactory} from '../extension/authenticate';

import {AuthenticateCustomerAccount} from './types';

export function authenticateCustomerAccountFactory(
  params: BasicParams,
): AuthenticateCustomerAccount {
  return authenticateExtensionFactory(
    params,
    'customer account',
  ) as AuthenticateCustomerAccount;
}
