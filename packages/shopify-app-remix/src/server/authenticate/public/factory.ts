import {BasicParams} from '../../types';

import {authenticateCheckoutFactory} from './checkout/authenticate';
import {AuthenticateCheckoutOptions} from './checkout/types';
import {authenticateAppProxyFactory} from './appProxy/authenticate';
import {AuthenticatePublic} from './types';

export function authenticatePublicFactory(
  params: BasicParams,
): AuthenticatePublic {
  const {logger} = params;

  const authenticateCheckout = authenticateCheckoutFactory(params);
  const authenticatePublic = (
    request: Request,
    options: AuthenticateCheckoutOptions,
  ) => {
    logger.deprecated(
      '2.0.0',
      'authenticate.public() will be deprecated in v2. Use authenticate.public.checkout() instead.',
    );

    return authenticateCheckout(request, options);
  };

  authenticatePublic.checkout = authenticateCheckout;
  authenticatePublic.appProxy = authenticateAppProxyFactory(params);

  return authenticatePublic;
}
