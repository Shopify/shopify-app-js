import {HttpResponseError, Session} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {redirectToAuthPage} from '../helpers';

import type {CancelBillingOptions} from './types';

export function cancelBillingFactory(
  params: BasicParams,
  request: Request,
  session: Session,
) {
  return async function cancelBilling(options: CancelBillingOptions) {
    const {api, logger} = params;

    logger.debug('Cancelling billing', {shop: session.shop, ...options});

    try {
      return await api.billing.cancel({
        session,
        subscriptionId: options.subscriptionId,
        isTest: options.isTest,
        prorate: options.prorate,
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug('API token was invalid, redirecting to OAuth', {
          shop: session.shop,
        });
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }
  };
}
