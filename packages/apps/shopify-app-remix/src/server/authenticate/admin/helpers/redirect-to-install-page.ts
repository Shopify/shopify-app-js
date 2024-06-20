import {redirect as remixRedirect} from '@remix-run/server-runtime';

import type {BasicParams} from '../../../types';

import {redirectWithAppBridgeHeaders} from './redirect-with-app-bridge-headers';

export async function redirectToInstallPage(
  params: BasicParams,
  shop: string,
  optionalScopes: string[] = [],
  isEmbedded: boolean,
): Promise<never> {
  const installUrl = buildInstallUrl(params, shop, optionalScopes);
  if (isEmbedded) {
    throw redirectWithAppBridgeHeaders(installUrl);
  } else {
    throw remixRedirect(installUrl);
  }
}

function buildInstallUrl(
  {api, config}: BasicParams,
  shop: string,
  optionalScopes: string[] = [],
) {
  const optionalScopesParam =
    optionalScopes && optionalScopes.length > 0
      ? {optional_scopes: optionalScopes.join(',')}
      : {};

  const query = {
    client_id: config.apiKey,
    scope: config.scopes?.toString() || '',
    ...optionalScopesParam,
  };

  const processedQuery = new api.utils.ProcessedQuery();
  processedQuery.putAll(query);

  const cleanShop = api.utils.sanitizeShop(shop);
  return `https://${cleanShop}/admin/oauth/install${processedQuery.stringify()}`;
}
