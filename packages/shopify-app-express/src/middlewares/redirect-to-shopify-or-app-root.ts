import {Request, Response} from 'express';

import {ApiAndConfigParams} from '../types';

import {RedirectToShopifyOrAppRootMiddleware} from './types';

export function redirectToShopifyOrAppRoot({
  api,
  config,
}: ApiAndConfigParams): RedirectToShopifyOrAppRootMiddleware {
  return function () {
    return async function (req: Request, res: Response) {
      if (res.headersSent) {
        await config.logger.info(
          'Response headers have already been sent, skipping redirection to host',
          {shop: res.locals.shopify?.session?.shop},
        );

        return;
      }

      const host = api.utils.sanitizeHost(req.query.host as string)!;
      const redirectUrl = api.config.isEmbeddedApp
        ? await api.auth.getEmbeddedAppUrl({
            rawRequest: req,
            rawResponse: res,
          })
        : `/?shop=${res.locals.shopify.session.shop}&host=${encodeURIComponent(
            host,
          )}`;

      await config.logger.debug(`Redirecting to host at ${redirectUrl}`, {
        shop: res.locals.shopify.session.shop,
      });

      res.redirect(redirectUrl);
    };
  };
}
