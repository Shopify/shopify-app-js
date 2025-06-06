import {
  BillingCheckResponseObject,
  HttpResponseError,
  Session,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import type {AppConfigArg} from '../../../config-types';
import {redirectToAuthPage} from '../helpers';
import {invalidateAccessToken} from '../../helpers';

import type {RequireBillingOptions} from './types';

export function requireBillingFactory<Config extends AppConfigArg>(
  params: BasicParams,
  request: Request,
  session: Session,
) {
  const {api, logger} = params;

  return async function requireBilling(options: RequireBillingOptions<Config>) {
    const logContext = {
      shop: session.shop,
      plans: options.plans,
      isTest: options.isTest,
    };

    logger.debug('Checking billing for the shop', logContext);

    let data: BillingCheckResponseObject;
    try {
      data = await api.billing.check({
        session,
        plans: options.plans as string[],
        isTest: options.isTest,
        returnObject: true,
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug('API token was invalid, redirecting to OAuth', logContext);

        await invalidateAccessToken(params, session);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }

    if (!data.hasActivePayment) {
      logger.debug('Billing check failed', logContext);
      throw await options.onFailure(new Error('Billing check failed'));
    }

    logger.debug('Billing check succeeded', logContext);

    return data;
  };
}
