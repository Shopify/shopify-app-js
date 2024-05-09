import type {BasicParams} from '../../../types';
import {authenticateExtensionFactory} from '../extension/authenticate';

import type {AuthenticateCheckout} from './types';

export function authenticateCheckoutFactory(
  params: BasicParams,
): AuthenticateCheckout {
  return authenticateExtensionFactory(
    params,
    'checkout',
  ) as AuthenticateCheckout;
}
