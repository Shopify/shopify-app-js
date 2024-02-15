import {HttpResponseError, Session} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {redirectToAuthPage} from '../helpers';
import type {AppConfigArg} from '../../../config-types';

import type {CheckBillingOptions} from './types';

export function checkBillingFactory<Config extends AppConfigArg>(
  params: BasicParams,
  request: Request,
  session: Session,
) {
  return async function checkBilling(options: CheckBillingOptions<Config>) {
    const {api, logger, config} = params;

    logger.debug('Checking billing plans', {shop: session.shop, ...options});

    try {
      return await api.billing.check({
        session,
        plans: options.plans as string[],
        isTest: options.isTest,
        returnObject: true,
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug('API token was invalid, redirecting to OAuth', {
          shop: session.shop,
        });
        await config.sessionStorage.deleteSession(session.id);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }
  };
}
