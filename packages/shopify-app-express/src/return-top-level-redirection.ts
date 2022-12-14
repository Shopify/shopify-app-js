import {ReturnTopLevelRedirectionParams} from './types';

export async function returnTopLevelRedirection({
  res,
  config,
  bearerPresent,
  redirectUrl,
}: ReturnTopLevelRedirectionParams): Promise<void> {
  // If the request has a bearer token, the app is currently embedded, and must break out of the iframe to
  // re-authenticate
  if (bearerPresent) {
    await config.logger.debug(
      `Redirecting to top level at ${redirectUrl} while embedded, returning headers`,
    );

    res.status(403);
    res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
    res.header('X-Shopify-API-Request-Failure-Reauthorize-Url', redirectUrl);
    res.end();
  } else {
    await config.logger.debug(
      `Redirecting to ${redirectUrl} while at the top level`,
    );

    res.redirect(redirectUrl);
  }
}
