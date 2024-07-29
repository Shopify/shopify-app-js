import {BasicParams} from 'src/server/types';

import {
  respondToBotRequest,
  respondToOptionsRequest,
  getSessionTokenHeader,
  validateSessionToken,
  ensureCORSHeadersFactory,
} from '../../helpers';

import {AuthenticateExtension, ExtensionContext} from './types';

export function authenticateExtensionFactory(
  params: BasicParams,
  requestType: string,
): AuthenticateExtension {
  return async function authenticateExtension(
    request,
    options = {},
  ): Promise<ExtensionContext> {
    const {logger} = params;

    const corsHeaders = options.corsHeaders ?? [];

    respondToBotRequest(params, request);
    respondToOptionsRequest(params, request, corsHeaders);

    const sessionTokenHeader = getSessionTokenHeader(request);

    logger.info(`Authenticating ${requestType} request`);

    if (!sessionTokenHeader) {
      logger.debug('Request did not contain a session token');
      throw new Response(undefined, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    return {
      sessionToken: await validateSessionToken(
        params,
        request,
        sessionTokenHeader,
        {checkAudience: false},
      ),
      cors: ensureCORSHeadersFactory(params, request, corsHeaders),
    };
  };
}
