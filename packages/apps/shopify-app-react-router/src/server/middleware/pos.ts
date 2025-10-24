import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import type {AppConfigArg} from '../config-types';

import {posContext} from './contexts';
import type {POSContext, POSMiddlewareOptions} from './types';
import {authenticateExtension} from './extension-base';

/**
 * Creates POS UI extension authentication middleware.
 *
 * This middleware validates POS UI extension requests using session tokens
 * and provides CORS support for cross-origin requests.
 *
 * IMPORTANT: This middleware matches the behavior of authenticate.pos()
 * - Rejects bot requests (except Shopify agents)
 * - Handles OPTIONS requests for CORS preflight
 * - Validates session token from Authorization header
 * - Provides CORS helper function
 *
 * @example
 * ```typescript
 * // app/routes/api.pos.cart-items.tsx
 * export const middleware = [withPOS()];
 *
 * export async function loader({ context }) {
 *   const { sessionToken, cors } = context.get(posContext);
 *
 *   const shop = sessionToken.dest;
 *   const cartItems = await getCartItems(shop);
 *
 *   return cors(json(cartItems));
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom CORS headers
 * export const middleware = [
 *   withPOS({ corsHeaders: ["X-POS-Version"] })
 * ];
 * ```
 */
export function createWithPOS<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
  options: POSMiddlewareOptions = {},
): MiddlewareFunction {
  return async ({context, request}, next) => {
    // Use shared extension authentication helper
    const extensionCtx = await authenticateExtension(
      params,
      request,
      'pos',
      options,
    );

    // Set POS-specific context
    const posCtx: POSContext = extensionCtx;
    context.set(posContext, posCtx);

    return next();
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withPOSFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return (options?: POSMiddlewareOptions): MiddlewareFunction => {
    return createWithPOS<Config>(params, options);
  };
}
