import {Request, Response} from 'express';

import {AppConfigInterface} from '../config-types';

/**
 * For CORS preflight `OPTIONS` requests we should only set the CORS headers and
 * respond, instead of trying to authenticate them. Admin extensions send a
 * preflight `OPTIONS` request before the authenticated fetch, and that request
 * never carries the session token, so running it through the authentication
 * flow would always fail and redirect.
 *
 * Returns `true` when the request was an `OPTIONS` preflight and a response was
 * sent, so callers can stop further processing.
 */
export function respondToOptionsRequest(
  config: AppConfigInterface,
  req: Request,
  res: Response,
): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  config.logger.debug(
    'Preflight OPTIONS request, responding with CORS headers',
  );

  res.status(204);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.append('Access-Control-Expose-Headers', [
    'X-Shopify-Api-Request-Failure-Reauthorize',
    'X-Shopify-Api-Request-Failure-Reauthorize-Url',
  ]);
  res.header('Access-Control-Max-Age', '7200');
  res.end();

  return true;
}
