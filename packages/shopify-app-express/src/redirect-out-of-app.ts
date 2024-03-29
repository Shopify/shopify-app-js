import {Request, Response} from 'express';

import {AppConfigInterface} from './config-types';
import {RedirectOutOfAppFunction, ApiAndConfigParams} from './types';

export function redirectOutOfApp({
  api,
  config,
}: ApiAndConfigParams): RedirectOutOfAppFunction {
  return function redirectOutOfApp({req, res, redirectUri, shop}): void {
    if (
      (!api.config.isEmbeddedApp && isFetchRequest(req)) ||
      req.headers.authorization?.match(/Bearer (.*)/)
    ) {
      appBridgeHeaderRedirect(config, res, redirectUri);
    } else if (req.query.embedded === '1') {
      exitIframeRedirect(config, req, res, redirectUri, shop);
    } else {
      serverSideRedirect(config, res, redirectUri, shop);
    }
  };
}

function appBridgeHeaderRedirect(
  config: AppConfigInterface,
  res: Response,
  redirectUri: string,
) {
  config.logger.debug(
    `Redirecting: request has bearer token, returning headers to ${redirectUri}`,
  );

  res.status(403);
  res.append('Access-Control-Expose-Headers', [
    'X-Shopify-Api-Request-Failure-Reauthorize',
    'X-Shopify-Api-Request-Failure-Reauthorize-Url',
  ]);
  res.header('X-Shopify-API-Request-Failure-Reauthorize', '1');
  res.header('X-Shopify-API-Request-Failure-Reauthorize-Url', redirectUri);
  res.end();
}

function exitIframeRedirect(
  config: AppConfigInterface,
  req: Request,
  res: Response,
  redirectUri: string,
  shop: string,
): void {
  config.logger.debug(
    `Redirecting: request is embedded, using exitiframe path to ${redirectUri}`,
    {shop},
  );

  const queryParams = new URLSearchParams({
    ...req.query,
    shop,
    redirectUri,
  }).toString();

  res.redirect(`${config.exitIframePath}?${queryParams}`);
}

function serverSideRedirect(
  config: AppConfigInterface,
  res: Response,
  redirectUri: string,
  shop: string,
): void {
  config.logger.debug(
    `Redirecting: request is at top level, going to ${redirectUri} `,
    {shop},
  );

  res.redirect(redirectUri);
}

function isFetchRequest(req: Request) {
  return req.xhr || req.headers['sec-fetch-dest'] === 'empty';
}
