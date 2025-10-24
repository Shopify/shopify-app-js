import type {MiddlewareFunction} from 'react-router';
import type {JwtPayload} from '@shopify/shopify-api';

import type {BasicParams} from '../types';
import {
  respondToBotRequest,
  respondToOptionsRequest,
  getSessionTokenHeader,
  validateSessionToken,
  ensureCORSHeadersFactory,
  getShopFromRequest,
} from '../authenticate/helpers';
import type {EnsureCORSFunction} from '../authenticate/helpers/ensure-cors-headers';

/**
 * Base context for extension authentication (checkout, customer account, POS, etc.)
 */
export interface ExtensionContext {
  sessionToken: JwtPayload;
  cors: EnsureCORSFunction;
}

/**
 * Options for extension middleware
 */
export interface ExtensionMiddlewareOptions {
  corsHeaders?: string[];
}

/**
 * Creates context for Shopify UI extensions that use session token authentication.
 *
 * This is a shared helper used by checkout, customer account, and POS middleware.
 *
 * Common functionality:
 * - Rejects bot requests (except Shopify agents)
 * - Handles OPTIONS requests for CORS preflight
 * - Validates session token from Authorization header
 * - Provides CORS helper function
 *
 * @param params - Basic app parameters
 * @param request - The request object
 * @param extensionType - Type of extension for logging (e.g., 'checkout', 'customer account')
 * @param options - Extension options (custom CORS headers)
 * @returns Extension context with sessionToken and cors
 */
export async function authenticateExtension(
  params: BasicParams,
  request: Request,
  extensionType: string,
  options: ExtensionMiddlewareOptions = {},
): Promise<ExtensionContext> {
  const {logger} = params;
  const {corsHeaders = []} = options;

  // Reject bot requests (except Shopify agents like POS and Mobile)
  respondToBotRequest(params, request);

  // Handle OPTIONS requests for CORS preflight
  // This throws a Response and doesn't call next()
  respondToOptionsRequest(params, request, corsHeaders);

  // Extract session token from Authorization header
  const sessionTokenHeader = getSessionTokenHeader(request);

  logger.info(`Authenticating ${extensionType} request`, {
    shop: getShopFromRequest(request),
  });

  if (!sessionTokenHeader) {
    logger.debug('Request did not contain a session token', {
      shop: getShopFromRequest(request),
    });
    throw new Response(undefined, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }

  // Validate session token
  // checkAudience: false - don't validate aud claim for public extensions
  // retryRequest: false - don't add retry header
  const sessionToken = await validateSessionToken(
    params,
    request,
    sessionTokenHeader,
    {checkAudience: false, retryRequest: false},
  );

  // Create CORS helper with custom headers
  const cors = ensureCORSHeadersFactory(params, request, corsHeaders);

  // Return context
  return {
    sessionToken,
    cors,
  };
}
