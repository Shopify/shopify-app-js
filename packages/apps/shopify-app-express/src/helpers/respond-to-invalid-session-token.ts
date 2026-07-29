import {Response} from 'express';

import {RETRY_INVALID_SESSION_HEADER} from '../const';

/**
 * Sends a 401 response indicating the session token is invalid.
 *
 * When `retryRequest` is true, the response includes the
 * `X-Shopify-Retry-Invalid-Session-Request: 1` header, which signals App
 * Bridge to obtain a fresh session token and automatically retry the request.
 * Pass `true` when the token itself was stale or unverifiable; pass `false`
 * (the default) when auth has failed for another reason (e.g. a revoked access
 * token) and a retry without first re-authenticating would not help.
 *
 * This mirrors the behaviour of `respondToInvalidSessionToken` in the Remix
 * package, adapted for Express (no bounce-page redirect since Express apps
 * do not have an equivalent route).
 */
export function respondToInvalidSessionToken(
  res: Response,
  message: string,
  retryRequest = false,
): void {
  if (retryRequest) {
    res.set(RETRY_INVALID_SESSION_HEADER, '1');
  }
  res.status(401).send(message);
}
