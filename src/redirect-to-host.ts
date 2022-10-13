import {Session, Shopify} from '@shopify/shopify-api';
import {Request, Response} from 'express';

export async function redirectToHost(
  req: Request,
  res: Response,
  api: Shopify,
  session: Session,
) {
  const host = api.utils.sanitizeHost(req.query.host as string)!;
  const redirectUrl = api.config.isEmbeddedApp
    ? await api.auth.getEmbeddedAppUrl({
        rawRequest: req,
        rawResponse: res,
      })
    : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;

  res.redirect(redirectUrl);
}
