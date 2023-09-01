import {BasicParams} from '../../../types';

import {AuthenticateAppProxy} from './types';

export function authenticateAppProxyFactory({
  logger,
  api,
}: BasicParams): AuthenticateAppProxy {
  return async function authenticateAppProxy(request): Promise<undefined> {
    logger.info('Authenticating app proxy request');

    const {searchParams} = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    let isValid = false;

    try {
      isValid = await api.utils.validateHmac(query, {
        signator: 'appProxy',
      });
    } catch (error) {
      logger.info(error.message);
      throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
    }

    if (!isValid) {
      logger.info('App proxy request has invalid signature');
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    return undefined;
  };
}
