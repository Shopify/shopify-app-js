import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import type {AppConfigArg} from '../config-types';

import {createWithAuthentication} from './auth';
import {withBillingRequiredFactory} from './billing-required';
import {withWebhookFactory} from './webhook';
import {withFlowFactory} from './flow';
import {withCheckoutFactory} from './checkout';
import {withAppProxyFactory} from './app-proxy';
import {withCustomerAccountFactory} from './customer-account';
import {withFulfillmentServiceFactory} from './fulfillment-service';
import {withPOSFactory} from './pos';
import type {
  AuthMiddlewareOptions,
  BillingRequiredOptions,
  CheckoutMiddlewareOptions,
  CustomerAccountMiddlewareOptions,
  POSMiddlewareOptions,
} from './types';

/**
 * Creates the Shopify middleware factory with all available middleware functions
 *
 * This factory is used by shopifyApp() to provide pre-configured middleware
 * that developers can use in their React Router routes.
 *
 * @param params - Basic app parameters (api, config, logger)
 * @returns Object with all middleware creator functions
 */
export function createShopifyMiddleware<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return {
    withAuthentication: (options?: AuthMiddlewareOptions): MiddlewareFunction =>
      createWithAuthentication(params, options),

    withBillingRequired: (
      options: BillingRequiredOptions<Config>,
    ): MiddlewareFunction =>
      withBillingRequiredFactory<Config>(params)(options),

    withWebhook: withWebhookFactory<Config>(params),

    withFlow: withFlowFactory<Config>(params),

    withCheckout: withCheckoutFactory<Config>(params),

    withAppProxy: withAppProxyFactory<Config>(params),

    withCustomerAccount: withCustomerAccountFactory<Config>(params),

    withFulfillmentService: withFulfillmentServiceFactory<Config>(params),

    withPOS: withPOSFactory<Config>(params),
  };
}
