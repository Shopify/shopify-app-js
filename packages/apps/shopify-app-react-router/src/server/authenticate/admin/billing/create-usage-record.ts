import {HttpResponseError, Session} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {
  invalidateAccessToken,
  respondToInvalidSessionToken,
} from '../../helpers';

import type {CreateUsageRecordOptions} from './types';

export function createUsageRecordFactory(
  params: BasicParams,
  request: Request,
  session: Session,
) {
  return async function createUsageRecord(options: CreateUsageRecordOptions) {
    const {api, logger} = params;

    logger.debug('Create usage record', {shop: session.shop, ...options});

    try {
      return await api.billing.createUsageRecord({
        ...options,
        session,
      });
    } catch (error) {
      if (error instanceof HttpResponseError && error.response.code === 401) {
        logger.debug('API token was invalid, responding to invalid session', {
          shop: session.shop,
        });

        await invalidateAccessToken(params, session);

        throw respondToInvalidSessionToken({
          params,
          request,
          retryRequest: true,
        });
      }
      throw error;
    }
  };
}
