import {ShopifyHeader} from '@shopify/shopify-api';
import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import {adminClientFactory} from '../clients/admin';
import {createOrLoadOfflineSession} from '../authenticate/helpers';
import type {AppConfigArg} from '../config-types';

import {fulfillmentServiceContext} from './contexts';
import type {FulfillmentServiceContext} from './types';

/**
 * Creates fulfillment service authentication middleware.
 *
 * This middleware validates fulfillment service requests, loads the shop's session,
 * and provides fulfillment data through context.
 *
 * IMPORTANT: This middleware matches the behavior of authenticate.fulfillmentService()
 * - Validates fulfillment service request signature
 * - Parses fulfillment payload (with 'kind' field)
 * - Loads offline session (REQUIRED - throws 400 if not found)
 * - Creates admin API client
 *
 * @example
 * ```typescript
 * // app/routes/fulfillment-service.tsx
 * export const middleware = [withFulfillmentService()];
 *
 * export async function action({ context }) {
 *   const { session, payload, admin } = context.get(fulfillmentServiceContext);
 *
 *   // Session and admin are always available (required for fulfillment)
 *   switch (payload.kind) {
 *     case 'FULFILLMENT_REQUEST':
 *       await handleFulfillmentRequest(payload, admin);
 *       break;
 *     case 'CANCELLATION_REQUEST':
 *       await handleCancellation(payload, admin);
 *       break;
 *   }
 *
 *   return new Response(null, { status: 200 });
 * }
 * ```
 */
export function createWithFulfillmentService<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
): MiddlewareFunction {
  const {api, logger} = params;

  return async ({context, request}, next) => {
    logger.info('Authenticating fulfillment service request');

    // Fulfillment service requests MUST be POST
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

    // Clone request before reading body to preserve original stream
    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();

    // Validate fulfillment service request using Shopify API's validation
    const result = await api.fulfillmentService.validate({
      rawBody,
      rawRequest: clonedRequest,
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

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Extract shop from header
    const shop = request.headers.get(ShopifyHeader.Domain) || '';

    logger.debug(
      'Fulfillment service request is valid, looking for an offline session',
      {shop},
    );

    // Load session (REQUIRED for fulfillment service - unlike webhooks)
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

    // Create admin API client (always available for fulfillment service)
    const admin = adminClientFactory({params, session});

    // Build fulfillment service context
    const fulfillmentCtx: FulfillmentServiceContext = {
      session,
      payload,
      admin,
    };

    // Set context for action
    context.set(fulfillmentServiceContext, fulfillmentCtx);

    return next();
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withFulfillmentServiceFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return (): MiddlewareFunction => {
    return createWithFulfillmentService<Config>(params);
  };
}
