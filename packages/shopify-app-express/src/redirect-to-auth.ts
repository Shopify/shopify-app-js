import {Shopify} from '@shopify/shopify-api';
import {Request, Response} from 'express';

import {RedirectToAuthParams} from './types';
import {redirectOutOfApp} from './redirect-out-of-app';
import {AppConfigInterface} from './config-types';

export async function redirectToAuth({
  req,
  res,
  api,
  config,
  isOnline = false,
}: RedirectToAuthParams) {
  const shop = api.utils.sanitizeShop(req.query.shop as string);
  if (!shop) {
    config.logger.error('No shop provided to redirect to auth');
    res.status(500);
    res.send('No shop provided');
    return;
  }

  if (req.query.embedded === '1') {
    clientSideRedirect(api, config, req, res, shop);
  } else {
    await serverSideRedirect(api, config, req, res, shop, isOnline);
  }
}

function clientSideRedirect(
  api: Shopify,
  config: AppConfigInterface,
  req: Request,
  res: Response,
  shop: string,
): void {
  const host = api.utils.sanitizeHost(req.query.host as string);
  if (!host) {
    res.status(500);
    res.send('No host provided');
    return;
  }

  const redirectUriParams = new URLSearchParams({shop, host}).toString();
  const redirectUri = `${api.config.hostScheme}://${api.config.hostName}${config.auth.path}?${redirectUriParams}`;

  redirectOutOfApp({config})({req, res, redirectUri, shop});
}

async function serverSideRedirect(
  api: Shopify,
  config: AppConfigInterface,
  req: Request,
  res: Response,
  shop: string,
  isOnline: boolean,
): Promise<void> {
  config.logger.debug(
    `Redirecting to auth at ${config.auth.path}, with callback ${config.auth.callbackPath}`,
    {shop, isOnline},
  );

  await api.auth.begin({
    callbackPath: config.auth.callbackPath,
    shop,
    isOnline,
    rawRequest: req,
    rawResponse: res,
  });
}
