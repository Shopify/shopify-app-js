import {redirect} from 'react-router';

import type {BasicParams} from '../../../types';
import {AppDistribution} from '../../../types';

export async function redirectToShopifyOrAppRoot(
  request: Request,
  params: BasicParams,
  responseHeaders?: Headers,
): Promise<never> {
  const {api, config} = params;
  const url = new URL(request.url);

  const host = api.utils.sanitizeHost(url.searchParams.get('host')!)!;
  const shop = api.utils.sanitizeShop(url.searchParams.get('shop')!)!;

  let redirectUrl;
  if (config.distribution === AppDistribution.ShopifyAdmin) {
    redirectUrl = `/?shop=${shop}&host=${encodeURIComponent(host)}`;
  } else {
    redirectUrl = await api.auth.getEmbeddedAppUrl({rawRequest: request});
  }

  throw redirect(redirectUrl, {headers: responseHeaders});
}
