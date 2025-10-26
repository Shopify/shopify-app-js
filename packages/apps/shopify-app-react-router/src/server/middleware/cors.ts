import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import type {AppConfigArg} from '../config-types';
import {REAUTH_URL_HEADER} from '../authenticate/const';

import type {CORSMiddlewareOptions} from './types';

/**
 * Creates CORS middleware that adds CORS headers to cross-origin responses.
 *
 * This middleware follows React Router's idiomatic pattern for response header modification.
 * It intercepts the response from loaders/actions and adds CORS headers when the request
 * originates from a different domain (e.g., admin UI extensions).
 *
 * IMPORTANT: This middleware replaces the cors() helper from authenticate.admin()
 * - Automatically detects cross-origin requests
 * - Adds appropriate CORS headers to responses
 * - Works with ANY authentication type (admin, webhook, checkout, etc.)
 *
 * @example
 * ```typescript
 * // app/routes/api.admin-extension.tsx
 * export const middleware = [
 *   withAuthentication(),
 *   withCORS() // Add CORS to responses
 * ];
 *
 * export async function loader({ context }) {
 *   const admin = context.get(adminContext);
 *   const data = await admin.api.graphql(`query { ... }`);
 *
 *   // No cors() wrapping needed - middleware handles it!
 *   return json(await data.json());
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom CORS headers
 * export const middleware = [
 *   withCheckout(),
 *   withCORS({ corsHeaders: ["X-Custom-Header"] })
 * ];
 * ```
 *
 * @example
 * ```typescript
 * // Apply to all API routes via parent
 * // app/routes/api.tsx
 * export const middleware = [
 *   withAuthentication(),
 *   withCORS() // All child routes get CORS
 * ];
 * ```
 */
export function createWithCORS<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
  options: CORSMiddlewareOptions = {},
): MiddlewareFunction {
  const {logger, config} = params;
  const {corsHeaders = []} = options;

  return async ({request}, next) => {
    const response = (await next()) as Response;

    const origin = request.headers.get('Origin');

    if (origin && origin !== config.appUrl) {
      logger.debug(
        'Request comes from a different origin, adding CORS headers',
        {origin, appUrl: config.appUrl},
      );

      const allowHeadersSet = new Set([
        'Authorization',
        'Content-Type',
        ...corsHeaders,
      ]);

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set(
        'Access-Control-Allow-Headers',
        [...allowHeadersSet].join(', '),
      );
      response.headers.set('Access-Control-Expose-Headers', REAUTH_URL_HEADER);
    }

    return response;
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withCORSFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return (options?: CORSMiddlewareOptions): MiddlewareFunction => {
    return createWithCORS<Config>(params, options);
  };
}
