import type {BasicParams} from '../../types';
import {
  getSessionTokenHeader,
  rejectBotRequest,
  respondToOptionsRequest,
  validateSessionToken,
} from '../helpers';

import type {PublicContext} from './types';

export function authenticatePublicFactory(params: BasicParams) {
  return async function authenticatePublic(
    request: Request,
  ): Promise<PublicContext> {
    const {logger} = params;

    rejectBotRequest(params, request);
    respondToOptionsRequest(params, request);

    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info('Authenticating public request');

    if (!sessionTokenHeader) {
      logger.debug('Request did not contain a session token');
      throw new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    return {
      sessionToken: await validateSessionToken(params, sessionTokenHeader),
    };
  };
}
