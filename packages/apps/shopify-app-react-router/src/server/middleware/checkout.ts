import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import type {AppConfigArg} from '../config-types';

import {checkoutContext} from './contexts';
import type {CheckoutContext, CheckoutMiddlewareOptions} from './types';
import {authenticateExtension} from './extension-base';

/**
 * Creates checkout extension authentication middleware.
 *
 * This middleware validates checkout UI extension requests using session tokens
 * and provides CORS support for cross-origin requests.
 *
 * IMPORTANT: This middleware matches the behavior of authenticate.public.checkout()
 * - Rejects bot requests (except Shopify agents)
 * - Handles OPTIONS requests for CORS preflight
 * - Validates session token from Authorization header
 * - Provides CORS helper function
 *
 * @example
 * ```typescript
 * // app/routes/api.checkout.widgets.tsx
 * export const middleware = [withCheckout()];
 *
 * export async function loader({ context }) {
 *   const { sessionToken, cors } = context.get(checkoutContext);
 *
 *   const widgets = await getWidgets(sessionToken.dest);
 *
 *   return cors(widgets);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom CORS headers
 * export const middleware = [
 *   withCheckout({ corsHeaders: ["X-Custom-Header"] })
 * ];
 * ```
 */
export function createWithCheckout<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
  options: CheckoutMiddlewareOptions = {},
): MiddlewareFunction {
  return async ({context, request}, next) => {
    // Use shared extension authentication helper
    const extensionCtx = await authenticateExtension(
      params,
      request,
      'checkout',
      options,
    );

    // Set checkout-specific context
    const checkoutCtx: CheckoutContext = extensionCtx;
    context.set(checkoutContext, checkoutCtx);

    return next();
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withCheckoutFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return (options?: CheckoutMiddlewareOptions): MiddlewareFunction => {
    return createWithCheckout<Config>(params, options);
  };
}
