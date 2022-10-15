import {ReturnTopLevelRedirectionParams} from './types';

export function returnTopLevelRedirection({
  res,
  bearerPresent,
  redirectUrl,
}: ReturnTopLevelRedirectionParams) {
  // If the request has a bearer token, the app is currently embedded, and must break out of the iframe to
  // re-authenticate
  if (bearerPresent) {
    res.status(403);
    res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
    res.header('X-Shopify-API-Request-Failure-Reauthorize-Url', redirectUrl);
    res.end();
  } else {
    res.redirect(redirectUrl);
  }
}
