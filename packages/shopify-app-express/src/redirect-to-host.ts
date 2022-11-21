import {RedirectToHostParams} from './types';

export async function redirectToHost({
  req,
  res,
  api,
  config,
  session,
}: RedirectToHostParams) {
  const host = api.utils.sanitizeHost(req.query.host as string)!;
  const redirectUrl = api.config.isEmbeddedApp
    ? await api.auth.getEmbeddedAppUrl({
        rawRequest: req,
        rawResponse: res,
      })
    : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;

  await config.logger.debug(`Redirecting to host at ${redirectUrl}`, {
    shop: session.shop,
  });

  res.redirect(redirectUrl);
}
