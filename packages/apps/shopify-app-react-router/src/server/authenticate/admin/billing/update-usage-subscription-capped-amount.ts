import {
  HttpResponseError,
  Session,
  UpdateCappedAmountConfirmation,
} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {redirectToAuthPage} from '../helpers';
import {invalidateAccessToken} from '../../helpers';

import {UpdateUsageCappedAmountOptions} from './types';
import {redirectOutOfApp} from './helpers';

export function updateUsageCappedAmountFactory(
  params: BasicParams,
  request: Request,
  session: Session,
) {
  return async function updateUsageCappedAmount(
    options: UpdateUsageCappedAmountOptions,
  ): Promise<never> {
    const {api, logger} = params;

    logger.debug('Updating usage subscription capped amount', {
      shop: session.shop,
      ...options,
    });

    let result: UpdateCappedAmountConfirmation;
    try {
      result = await api.billing.updateUsageCappedAmount({
        session,
        subscriptionLineItemId: options.subscriptionLineItemId,
        cappedAmount: options.cappedAmount,
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug('API token was invalid, redirecting to OAuth', {
          shop: session.shop,
        });
        await invalidateAccessToken(params, session);
        throw await redirectToAuthPage(params, request, session.shop);
      } else {
        throw error;
      }
    }

    throw redirectOutOfApp(
      params,
      request,
      result.confirmationUrl,
      session.shop,
    );
  };
}
