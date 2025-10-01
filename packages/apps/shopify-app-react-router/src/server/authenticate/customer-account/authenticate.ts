import {BasicParams} from '../../types';
import {customerAccountClientFactory} from '../../clients/customer-account';

import {AuthenticateCustomerAccount, CustomerAccountAuthContext} from './types';

export function authenticateCustomerAccountFactory(
  params: BasicParams,
): AuthenticateCustomerAccount {
  return async function authenticateCustomerAccount(
    request: Request,
  ): Promise<CustomerAccountAuthContext> {
    const {config, logger} = params;

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      throw new Response('Missing session_id parameter', {status: 400});
    }

    const session = await config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw new Response('Customer account session not found', {status: 401});
    }

    if (!session.accessToken) {
      throw new Response('Customer account session missing access token', {
        status: 401,
      });
    }

    logger.debug('Loaded customer account session', {
      sessionId: session.id,
      shop: session.shop,
    });

    const customerAccountClient = customerAccountClientFactory({
      params,
      session,
    });

    return {
      session,
      ...customerAccountClient,
    };
  };
}