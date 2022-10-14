import {Shopify} from '@shopify/shopify-api';
import {Request, Response} from 'express';

import {AppConfigInterface, RedirectToAuthParams} from './types';

export async function redirectToAuth({
  req,
  res,
  api,
  config,
}: RedirectToAuthParams) {
  const shop = api.utils.sanitizeShop(req.query.shop as string);
  if (shop) {
    if (req.query.embedded === '1') {
      clientSideRedirect(api, config, shop, req, res);
    } else {
      serverSideRedirect(api, config, shop, req, res);
    }
  } else {
    res.status(500);
    res.send('No shop provided');
  }
}

function clientSideRedirect(
  api: Shopify,
  config: AppConfigInterface,
  shop: string,
  req: Request,
  res: Response,
): void {
  const host = api.utils.sanitizeHost(req.query.host as string);
  if (!host) {
    res.status(500);
    res.send('No host provided');
    return;
  }

  const redirectUriParams = new URLSearchParams({shop, host}).toString();

  const appHost = `${api.config.hostScheme}://${api.config.hostName}`;
  const queryParams = new URLSearchParams({
    ...req.query,
    shop,
    redirectUri: `${appHost}${config.auth.path}?${redirectUriParams}`,
  }).toString();

  res.redirect(`${config.exitIframePath}?${queryParams}`);
}

async function serverSideRedirect(
  api: Shopify,
  config: AppConfigInterface,
  shop: string,
  req: Request,
  res: Response,
): Promise<void> {
  await api.auth.begin({
    callbackPath: config.auth.callbackPath,
    shop,
    isOnline: config.useOnlineTokens,
    rawRequest: req,
    rawResponse: res,
  });
}
