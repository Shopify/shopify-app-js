import {ShopifyRestResources} from '@shopify/shopify-api';

import {adminClientFactory, storefrontClientFactory} from '../../../clients';
import {BasicParams} from '../../../types';

import {
  AppProxyContext,
  AppProxyContextWithSession,
  AuthenticateAppProxy,
  LiquidResponseFunction,
} from './types';

export function authenticateAppProxyFactory<
  Resources extends ShopifyRestResources,
>(params: BasicParams): AuthenticateAppProxy {
  const {api, config, logger} = params;

  return async function authenticate(
    request,
  ): Promise<AppProxyContext | AppProxyContextWithSession<Resources>> {
    logger.info('Authenticating app proxy request');

    const url = new URL(request.url);

    if (!(await validateAppProxyHmac(params, url))) {
      logger.info('App proxy request has invalid signature');
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const shop = url.searchParams.get('shop')!;
    const sessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage.loadSession(sessionId);

    if (!session) {
      const context: AppProxyContext = {
        liquid,
        session: undefined,
        admin: undefined,
        storefront: undefined,
      };

      return context;
    }

    const context: AppProxyContextWithSession<Resources> = {
      liquid,
      session,
      admin: adminClientFactory({params, session}),
      storefront: storefrontClientFactory({params, session}),
    };

    return context;
  };
}

const liquid: LiquidResponseFunction = (body, initAndOptions) => {
  if (typeof initAndOptions !== 'object') {
    return new Response(body, {
      status: initAndOptions || 200,
      headers: {
        'Content-Type': 'application/liquid',
      },
    });
  }

  const {layout, ...responseInit} = initAndOptions || {};
  const responseBody = layout === false ? `{% layout none %} ${body}` : body;

  const headers = new Headers(responseInit.headers);
  headers.set('Content-Type', 'application/liquid');

  return new Response(responseBody, {
    ...responseInit,
    headers,
  });
};

async function validateAppProxyHmac(
  params: BasicParams,
  url: URL,
): Promise<boolean> {
  const {api, logger} = params;

  try {
    let searchParams = new URLSearchParams(url.search);
    if (!searchParams.get('index')) {
      searchParams.delete('index');
    }

    let isValid = await api.utils.validateHmac(
      Object.fromEntries(searchParams.entries()),
      {signator: 'appProxy'},
    );

    if (!isValid) {
      const cleanPath = url.pathname
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replaceAll('/', '.');
      const data = `routes%2F${cleanPath}`;

      searchParams = new URLSearchParams(
        `?_data=${data}&${searchParams.toString().replace(/^\?/, '')}`,
      );

      isValid = await api.utils.validateHmac(
        Object.fromEntries(searchParams.entries()),
        {signator: 'appProxy'},
      );

      if (!isValid) {
        const searchParams = new URLSearchParams(
          `?_data=${data}._index&${url.search.replace(/^\?/, '')}`,
        );

        isValid = await api.utils.validateHmac(
          Object.fromEntries(searchParams.entries()),
          {signator: 'appProxy'},
        );
      }
    }

    return isValid;
  } catch (error) {
    logger.info(error.message);
    throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
  }
}
