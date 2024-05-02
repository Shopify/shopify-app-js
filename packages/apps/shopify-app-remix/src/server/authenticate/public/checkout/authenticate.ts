import type {BasicParams} from '../../../types';
import {authenticateExtensionFactory} from '../extension/authenticate';

import type {CheckoutContext} from './types';

export function authenticateCheckoutFactory(params: BasicParams) {
  return authenticateExtensionFactory<CheckoutContext>(params, 'checkout');
}
