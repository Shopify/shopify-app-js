import {adminClientFactory} from '../../clients/admin';
import {BasicParams} from '../../types';

import type {AuthenticateFlow, FlowContext} from './types';

export function authenticateFlowFactory(params: BasicParams): AuthenticateFlow {
  const {api, config, logger} = params;

  return async function authenticate(request: Request): Promise<FlowContext> {
    logger.info('Authenticating flow request');

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

    const rawBody = await request.text();
    const result = await api.flow.validate({
      rawBody,
      rawRequest: request,
    });

    if (!result.valid) {
      logger.error('Received an invalid flow request', {reason: result.reason});

      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const payload = JSON.parse(rawBody);

    logger.debug('Flow request is valid, looking for an offline session', {
      shop: payload.shopify_domain,
    });

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

    return {
      session,
      payload,
      admin: adminClientFactory({params, session}),
    };
  };
}
