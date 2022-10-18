import {Request, Response, NextFunction} from 'express';

import {redirectToAuth} from '../redirect-to-auth';
import {ApiAndConfigParams} from '../types';
import {AppInstallations} from '../app-installations';

import {EnsureInstalledMiddleware} from './types';

interface CreateEnsureInstalledParams extends ApiAndConfigParams {
  appInstallations: AppInstallations;
}

export function createEnsureInstalled({
  api,
  config,
  appInstallations,
}: CreateEnsureInstalledParams): EnsureInstalledMiddleware {
  return function ensureInstalled() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!api.config.isEmbeddedApp) {
        res.status(500);
        return res.send(
          'ensureInstalled() should only be used in embedded apps; use authenticatedRequest() instead',
        );
      }

      if (typeof req.query.shop !== 'string') {
        res.status(500);
        return res.send('No shop provided');
      }

      const shop = api.utils.sanitizeShop(req.query.shop);
      if (!shop) {
        res.status(500);
        return res.send('Invalid shop provided');
      }
      const appInstalled = await appInstallations.includes(shop);

      const exitIframeRE = new RegExp(`^${config.exitIframePath}`, 'i');
      if (!appInstalled && !req.originalUrl.match(exitIframeRE)) {
        return redirectToAuth({req, res, api, config});
      }

      if (api.config.isEmbeddedApp && req.query.embedded !== '1') {
        const embeddedUrl = await api.auth.getEmbeddedAppUrl({
          rawRequest: req,
          rawResponse: res,
        });

        return res.redirect(embeddedUrl + req.path);
      }
      return next();
    };
  };
}

export function createDeleteAppInstallationHandler(
  appInstallations: AppInstallations,
) {
  return async function deleteAppInstallationHandler(
    _topic: string,
    shop: string,
    _body: any,
  ) {
    await appInstallations.delete(shop);
  };
}
