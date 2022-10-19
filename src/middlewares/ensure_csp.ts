import {Request, Response, NextFunction} from 'express';
import {Shopify} from '@shopify/shopify-api';

import {EnsureCSPMiddleware} from './types';

interface CreateEnsureCSPParams {
  api: Shopify;
}

export function createEnsureCSP({
  api,
}: CreateEnsureCSPParams): EnsureCSPMiddleware {
  return function ensureCSP() {
    return async (req: Request, res: Response, next: NextFunction) => {
      addCSPHeader(api, req, res);
      next();
    };
  };
}

export function addCSPHeader(api: Shopify, req: Request, res: Response) {
  if (typeof req.query.shop === 'string') {
    const shop = api.utils.sanitizeShop(req.query.shop);
    if (api.config.isEmbeddedApp && shop) {
      res.setHeader(
        'Content-Security-Policy',
        `frame-ancestors https://${encodeURIComponent(
          shop,
        )} https://admin.shopify.com;`,
      );
    } else {
      res.setHeader('Content-Security-Policy', `frame-ancestors 'none';`);
    }
  }
}
