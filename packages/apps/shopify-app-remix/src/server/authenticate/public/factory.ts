import {ShopifyRestResources} from '@shopify/shopify-api';

import {BasicParams} from '../../types';
import {FutureFlagOptions} from '../../future/flags';

import {authenticateCheckoutFactory} from './checkout/authenticate';
import {AuthenticateCheckoutOptions} from './checkout/types';
import {authenticateAppProxyFactory} from './appProxy/authenticate';
import {authenticateCustomerAccountFactory} from './customer-account/authenticate';
import {
  AuthenticatePublic,
  AuthenticatePublicLegacy,
  AuthenticatePublicObject,
} from './types';

export function authenticatePublicFactory<
  Future extends FutureFlagOptions,
  Resources extends ShopifyRestResources,
>(params: BasicParams): AuthenticatePublic<Future> {
  const {logger, config} = params;

  const authenticateCheckout = authenticateCheckoutFactory(params);
  const authenticateAppProxy = authenticateAppProxyFactory<Resources>(params);
  const authenticateCustomerAccount =
    authenticateCustomerAccountFactory(params);

  if (config.future.v3_authenticatePublic) {
    const context: AuthenticatePublicObject = {
      checkout: authenticateCheckout,
      appProxy: authenticateAppProxy,
      customerAccount: authenticateCustomerAccount,
    };

    return context as AuthenticatePublic<Future>;
  }

  const authenticatePublic: AuthenticatePublicLegacy = (
    request: Request,
    options: AuthenticateCheckoutOptions,
  ) => {
    logger.deprecated(
      '3.0.0',
      'authenticate.public() will be deprecated in v3. Use authenticate.public.checkout() instead.',
    );

    return authenticateCheckout(request, options);
  };

  authenticatePublic.checkout = authenticateCheckout;
  authenticatePublic.appProxy = authenticateAppProxy;

  return authenticatePublic as AuthenticatePublic<Future>;
}
