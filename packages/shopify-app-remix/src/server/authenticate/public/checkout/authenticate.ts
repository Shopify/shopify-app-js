import type {BasicParams} from '../../../types';
import {
  ensureCORSHeadersFactory,
  getSessionTokenHeader,
  rejectBotRequest,
  respondToOptionsRequest,
  validateSessionToken,
} from '../../helpers';

import type {AuthenticateCheckoutOptions, CheckoutContext} from './types';

export function authenticateCheckoutFactory(params: BasicParams) {
  return async function authenticateCheckout(
    request: Request,
    options: AuthenticateCheckoutOptions = {},
  ): Promise<CheckoutContext> {
    const {logger} = params;

    const corsHeaders = options.corsHeaders ?? [];

    rejectBotRequest(params, request);
    respondToOptionsRequest(params, request, corsHeaders);

    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info('Authenticating checkout request');

    if (!sessionTokenHeader) {
      logger.debug('Request did not contain a session token');
      throw new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    return {
      sessionToken: await validateSessionToken(params, sessionTokenHeader, {
        checkAudience: false,
      }),
      cors: ensureCORSHeadersFactory(params, request, corsHeaders),
    };
  };
}
