import type {MiddlewareFunction} from 'react-router';

import type {BasicParams} from '../types';
import type {AppConfigArg} from '../config-types';

import {customerAccountContext} from './contexts';
import type {
  CustomerAccountContext,
  CustomerAccountMiddlewareOptions,
} from './types';
import {authenticateExtension} from './extension-base';

/**
 * Creates customer account extension authentication middleware.
 *
 * This middleware validates customer account UI extension requests using session tokens
 * and provides CORS support for cross-origin requests.
 *
 * IMPORTANT: This middleware matches the behavior of authenticate.public.customerAccount()
 * - Rejects bot requests (except Shopify agents)
 * - Handles OPTIONS requests for CORS preflight
 * - Validates session token from Authorization header
 * - Provides CORS helper function
 *
 * @example
 * ```typescript
 * // app/routes/api.customer-account.profile.tsx
 * export const middleware = [withCustomerAccount()];
 *
 * export async function loader({ context }) {
 *   const { sessionToken, cors } = context.get(customerAccountContext);
 *
 *   const customerId = sessionToken.sub;
 *   const profile = await getCustomerProfile(customerId);
 *
 *   return cors(json(profile));
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With custom CORS headers
 * export const middleware = [
 *   withCustomerAccount({ corsHeaders: ["X-Customer-Version"] })
 * ];
 * ```
 */
export function createWithCustomerAccount<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
  options: CustomerAccountMiddlewareOptions = {},
): MiddlewareFunction {
  return async ({context, request}, next) => {
    // Use shared extension authentication helper
    const extensionCtx = await authenticateExtension(
      params,
      request,
      'customer account',
      options,
    );

    // Set customer account-specific context
    const customerAccountCtx: CustomerAccountContext = extensionCtx;
    context.set(customerAccountContext, customerAccountCtx);

    return next();
  };
}

/**
 * Wrapper function for easier usage with pre-configured params
 * This is what gets exposed through the shopify.middleware API
 */
export function withCustomerAccountFactory<Config extends AppConfigArg>(
  params: BasicParams<Config['future']>,
) {
  return (
    options?: CustomerAccountMiddlewareOptions,
  ): MiddlewareFunction => {
    return createWithCustomerAccount<Config>(params, options);
  };
}
