import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import {adminClientFactory} from '../clients/admin';
import type {AppConfigArg} from '../config-types';

import {flowContext} from './contexts';
import type {FlowContext} from './types';

/**
 * Creates Flow authentication middleware.
 *
 * This middleware validates Shopify Flow extension requests, loads the shop's session,
 * and provides Flow data through context.
 *
 * IMPORTANT: This middleware matches the behavior of authenticate.flow()
 * - Validates Flow request signature
 * - Parses Flow payload
 * - Loads offline session (REQUIRED - throws 400 if not found)
 * - Creates admin API client
 *
 * @example
 * ```typescript
 * // app/routes/flow.my-action.tsx
 * export const middleware = [withFlow()];
 *
 * export async function action({ context }) {
 *   const { session, payload, admin } = context.get(flowContext);
 *
 *   // Session and admin are always available (required for Flow)
 *   const response = await admin.graphql(`mutation { ... }`);
 *
 *   return json({ success: true });
 * }
 * ```
 */
export function createWithFlow<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
): MiddlewareFunction {
  const {api, config, logger} = params;

  return async ({context, request}, next) => {
    logger.info('Authenticating flow request');

    // Flow requests MUST be POST
    if (request.method !== 'POST') {
      logger.debug(
        'Received a non-POST request for flow. Only POST requests are allowed.',
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

    // Validate Flow request using Shopify API's validation
    const result = await api.flow.validate({
      rawBody,
      rawRequest: clonedRequest,
    });

    if (!result.valid) {
      logger.error('Received an invalid flow request', {reason: result.reason});

      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    // Parse payload
    const payload = JSON.parse(rawBody);

    logger.debug('Flow request is valid, looking for an offline session', {
      shop: payload.shopify_domain,
    });

    // Load session (REQUIRED for Flow - unlike webhooks where it's optional)
    const sessionId = api.session.getOfflineId(payload.shopify_domain);
    const session = await config.sessionStorage!.loadSession(sessionId);

    if (!session) {
      logger.info('Flow request could not find session', {
        shop: payload.shopify_domain,
      });
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    logger.debug('Found a session for the flow request', {shop: session.shop});

    // Create admin API client (always available for Flow)
    const admin = adminClientFactory({params, session});

    // Build Flow context
    const flowCtx: FlowContext = {
      session,
      payload,
      admin,
    };

    // Set context for action
    context.set(flowContext, flowCtx);

    return next();
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withFlowFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return (): MiddlewareFunction => {
    return createWithFlow<Config>(params);
  };
}
