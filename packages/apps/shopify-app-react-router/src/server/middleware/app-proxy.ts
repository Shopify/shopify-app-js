import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import {adminClientFactory, storefrontClientFactory} from '../clients';
import type{AppConfigArg} from '../config-types';

import {appProxyContext} from './contexts';
import type {AppProxyContext, LiquidResponseFunction} from './types';

/**
 * Creates app proxy authentication middleware.
 *
 * This middleware validates app proxy requests using HMAC signature verification
 * from query parameters, loads the shop's session (if available), and provides
 * liquid response helper and API clients.
 *
 * IMPORTANT: This middleware matches the behavior of authenticate.public.appProxy()
 * - Validates HMAC signature from query parameters
 * - Loads offline session (optional - undefined if not installed)
 * - Creates admin and storefront API clients when session exists
 * - Provides liquid response helper for rendering Liquid templates
 *
 * @example
 * ```typescript
 * // app/routes/apps.proxy.widget.tsx
 * export const middleware = [withAppProxy()];
 *
 * export async function loader({ context }) {
 *   const { liquid, session, admin } = context.get(appProxyContext);
 *
 *   if (session && admin) {
 *     const data = await admin.graphql(`query { shop { name } }`);
 *     return liquid(`<h1>Hello {{shop.name}}</h1>`);
 *   }
 *
 *   return liquid(`<h1>Hello {{shop.name}}</h1>`);
 * }
 * ```
 */
export function createWithAppProxy<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
): MiddlewareFunction {
  const {api, config, logger} = params;

  return async ({context, request}, next) => {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop')!;

    logger.info('Authenticating app proxy request', {shop});

    // Validate HMAC signature from query parameters
    if (!(await validateAppProxyHmac(params, url))) {
      logger.info('App proxy request has invalid signature', {shop});
      throw new Response(undefined, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    // Load offline session (optional - might not exist)
    const sessionId = api.session.getOfflineId(shop);
    const session = await config.sessionStorage!.loadSession(sessionId);

    // Build app proxy context
    const proxyCtx: AppProxyContext = {
      liquid: createLiquidResponse(),
      session: session || undefined,
      admin: session ? adminClientFactory({params, session}) : undefined,
      storefront: session
        ? storefrontClientFactory({params, session})
        : undefined,
    };

    if (!session) {
      logger.debug('Could not find offline session, returning empty context', {
        shop,
        ...Object.fromEntries(url.searchParams.entries()),
      });
    }

    // Set context for loader/action
    context.set(appProxyContext, proxyCtx);

    return next();
  };
}

/**
 * Validates app proxy HMAC signature with fallback patterns for React Router
 */
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

    // Try direct validation
    let isValid = await api.utils.validateHmac(
      Object.fromEntries(searchParams.entries()),
      {signator: 'appProxy'},
    );

    if (!isValid) {
      // Try with React Router _data param pattern
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
        // Try with _index fallback
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
    const shop = url.searchParams.get('shop')!;
    logger.info((error as Error).message, {shop});
    throw new Response(undefined, {status: 400, statusText: 'Bad Request'});
  }
}

/**
 * Creates the liquid response helper function
 */
function createLiquidResponse(): LiquidResponseFunction {
  return (body: string, initAndOptions?) => {
    const processedBody = processLiquidBody(body);

    if (typeof initAndOptions !== 'object') {
      return new Response(processedBody, {
        status: initAndOptions || 200,
        headers: {
          'Content-Type': 'application/liquid',
        },
      });
    }

    const {layout, ...responseInit} = initAndOptions || {};
    const responseBody =
      layout === false ? `{% layout none %} ${processedBody}` : processedBody;

    const headers = new Headers(responseInit.headers);
    headers.set('Content-Type', 'application/liquid');

    return new Response(responseBody, {
      ...responseInit,
      headers,
    });
  };
}

/**
 * Processes Liquid body to add trailing slashes to relative URLs
 */
function processLiquidBody(body: string): string {
  return (
    body
      // Add trailing slashes to relative form action URLs
      .replaceAll(
        /<(form[^>]+)action="(\/[^"?]+)(\?[^"]+)?">/g,
        '<$1action="$2/$3">',
      )
      // Add trailing slashes to relative link href URLs
      .replaceAll(/<(a[^>]+)href="(\/[^"?]+)(\?[^"]+)?">/g, '<$1href="$2/$3">')
  );
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withAppProxyFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return (): MiddlewareFunction => {
    return createWithAppProxy<Config>(params);
  };
}
