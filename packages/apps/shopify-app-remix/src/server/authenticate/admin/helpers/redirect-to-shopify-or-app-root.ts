import {redirect} from '@remix-run/server-runtime';

import type {BasicParams} from '../../../types';

export async function redirectToShopifyOrAppRoot(
  request: Request,
  params: BasicParams,
  responseHeaders?: Headers,
): Promise<never> {
  const {api} = params;
  const url = new URL(request.url);

  const host = api.utils.sanitizeHost(url.searchParams.get('host')!)!;
  const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!)!;

  const redirectUrl = api.config.isEmbeddedApp
    ? await api.auth.getEmbeddedAppUrl({rawRequest: request})
    : `/?shop=${shop}&host=${encodeURIComponent(host)}`;

  throw redirect(redirectUrl, {headers: responseHeaders});
}
