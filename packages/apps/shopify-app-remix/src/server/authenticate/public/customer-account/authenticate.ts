import {BasicParams} from 'src/server/types';

import {authenticateExtensionFactory} from '../extension/authenticate';

import {CustomerAccountContext} from './types';

export function authenticateCustomerAccountFactory(params: BasicParams) {
  return authenticateExtensionFactory<CustomerAccountContext>(
    params,
    'customer account',
  );
}
