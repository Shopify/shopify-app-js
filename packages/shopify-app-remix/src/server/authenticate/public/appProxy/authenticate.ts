import {adminClientFactory} from '../../../clients/admin';
import {BasicParams} from '../../../types';

import {
  AppProxyContext,
  AppProxyContextWithSession,
  AuthenticateAppProxy,
} from './types';
import {ShopifyRestResources} from '@shopify/shopify-api';

export function authenticateAppProxyFactory<
  Resources extends ShopifyRestResources,
>(params: BasicParams): AuthenticateAppProxy {
  const {api, config, logger} = params;

  return async function authenticate(
    request,
  ): Promise<AppProxyContext | AppProxyContextWithSession<Resources>> {
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

    const shop = searchParams.get('shop')!;
    const sessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage.loadSession(sessionId);

    if (!session) {
      const context: AppProxyContext = {
        session: undefined,
        admin: undefined,
      };

      return context;
    }

    const context: AppProxyContextWithSession<Resources> = {
      session,
      admin: adminClientFactory({params, session}),
    };

    return context;
  };
}
