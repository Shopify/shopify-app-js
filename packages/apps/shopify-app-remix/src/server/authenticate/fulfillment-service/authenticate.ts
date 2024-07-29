import {ShopifyRestResources, ShopifyHeader} from '@shopify/shopify-api';

import {adminClientFactory} from '../../clients/admin';
import {BasicParams} from '../../types';
import {createOrLoadOfflineSession} from '../helpers';

import type {
  AuthenticateFulfillmentService,
  FulfillmentServiceContext,
} from './types';

export function authenticateFulfillmentServiceFactory<
  Resources extends ShopifyRestResources = ShopifyRestResources,
>(params: BasicParams): AuthenticateFulfillmentService<Resources> {
  const {api, logger} = params;

  return async function authenticate(
    request: Request,
  ): Promise<FulfillmentServiceContext<Resources>> {
    logger.info('Authenticating fulfillment service request');

    if (request.method !== 'POST') {
      logger.debug(
        'Received a non-POST request for fulfillment service. Only POST requests are allowed.',
        {url: request.url, method: request.method},
      );
      throw new Response(undefined, {
        status: 405,
        statusText: 'Method not allowed',
      });
    }

    const rawBody = await request.text();
    const result = await api.fulfillmentService.validate({
      rawBody,
      rawRequest: request,
    });

    if (!result.valid) {
      logger.error('Received an invalid fulfillment service request', {
        reason: result.reason,
      });

      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const payload = JSON.parse(rawBody);
    const shop = request.headers.get(ShopifyHeader.Domain) || '';

    logger.debug(
      'Fulfillment service request is valid, looking for an offline session',
      {
        shop,
      },
    );

    const session = await createOrLoadOfflineSession(shop, params);

    if (!session) {
      logger.info('Fulfillment service request could not find session', {
        shop,
      });
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    logger.debug('Found a session for the fulfillment service request', {
      shop,
    });

    return {
      session,
      payload,
      admin: adminClientFactory<Resources>({params, session}),
    };
  };
}
