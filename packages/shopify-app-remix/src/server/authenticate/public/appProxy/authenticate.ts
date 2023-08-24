import {ShopifyRestResources} from '@shopify/shopify-api';

import {adminClientFactory} from '../../../clients/admin';
import {BasicParams} from '../../../types';

import {AuthenticateAppProxy, AppProxyContext} from './types';

export function authenticateAppProxyFactory<
  Resources extends ShopifyRestResources,
>(params: BasicParams): AuthenticateAppProxy<Resources> {
  const {logger, api, config} = params;

  return async function authenticateAppProxy(
    request,
  ): Promise<AppProxyContext<Resources>> {
    logger.info('Authenticating app proxy request');

    const {searchParams} = new URL(request.url);

    try {
      const isValid = await api.utils.validateHmac(
        Object.fromEntries(searchParams.entries()),
      );

      if (!isValid) {
        throw badRequestResponse();
      }
    } catch {
      throw badRequestResponse();
    }

    const shop = searchParams.get('shop')!;
    const sessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw badRequestResponse();
    }

    return {
      admin: adminClientFactory({params, session}),
      session,
    };
  };
}

const badRequestResponse = () =>
  new Response(undefined, {status: 400, statusText: 'Bad Request'});
