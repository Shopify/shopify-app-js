import {ShopifyRestResources} from '@shopify/shopify-api';

import {adminClientFactory} from '../../../clients/admin';
import {BasicParams} from '../../../types';
import {
  ensureCORSHeadersFactory,
  rejectBotRequest,
  respondToOptionsRequest,
} from '../../helpers';

import {
  AuthenticateStorefrontAppProxy,
  StorefrontAppProxyContext,
} from './types';

export function authenticateStorefrontAppProxyFactory<
  Resources extends ShopifyRestResources,
>(params: BasicParams): AuthenticateStorefrontAppProxy<Resources> {
  const {logger, api, config} = params;

  return async function authenticateStorefrontAppProxy(
    request,
  ): Promise<StorefrontAppProxyContext<Resources>> {
    // TODO: Does the partner need to be able to pass CORS headers here?
    // Create an app proxy to check
    rejectBotRequest(params, request);

    // TODO: Does the partner need to be able to pass CORS headers here?
    // Create an app proxy to check
    respondToOptionsRequest(params, request);

    logger.info('Authenticating storefront app proxy request');

    const {searchParams} = new URL(request.url);
    const isValid = api.utils.validateHmac(
      Object.fromEntries(searchParams.entries()),
    );

    if (!isValid) {
      throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
    }

    const shop = searchParams.get('shop')!;
    const sessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
    }

    return {
      admin: adminClientFactory({params, session}),
      cors: ensureCORSHeadersFactory(params, request),
      session,
    };
  };
}
