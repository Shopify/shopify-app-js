import {Request, Response} from 'express';
import {Shopify} from '@shopify/shopify-api';

import {RETRY_INVALID_SESSION_HEADER} from '../const';

import {getSessionTokenHeader} from './get-session-token';
import {renderAppBridge} from './render-app-bridge';

interface RespondToInvalidSessionTokenParams {
  api: Shopify;
  req: Request;
  res: Response;
  message: string;
  retryRequest?: boolean;
}

/**
 * Responds to a request whose session token is missing, stale, or unverifiable.
 *
 * - Document requests (no Authorization header, e.g. an embedded page load)
 *   get the App Bridge bounce so the browser fetches a fresh token and reloads.
 * - Fetch requests (Authorization header present) get a 401. The
 *   `X-Shopify-Retry-Invalid-Session-Request` header is added only when a retry
 *   would help (`retryRequest`), so App Bridge refetches with a new token;
 *   it is omitted when re-auth is required (e.g. a revoked access token).
 */
export function respondToInvalidSessionToken({
  api,
  req,
  res,
  message,
  retryRequest = false,
}: RespondToInvalidSessionTokenParams): void {
  const isDocumentRequest = !getSessionTokenHeader(req);

  if (isDocumentRequest) {
    renderAppBridge(api, req, res);
    return;
  }

  if (retryRequest) {
    res.set(RETRY_INVALID_SESSION_HEADER, '1');
  }
  res.status(401).send(message);
}
