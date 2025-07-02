import {redirect as reactRouterRedirect} from 'react-router';

import type {BasicParams} from '../../../types';
import {AppDistribution} from '../../../types';

import {redirectWithAppBridgeHeaders} from './redirect-with-app-bridge-headers';

export async function redirectToInstallPage(
  params: BasicParams,
  shop: string,
  optionalScopes: string[] = [],
): Promise<never> {
  const installUrl = buildInstallUrl(params, shop, optionalScopes);
  if (params.config.distribution === AppDistribution.ShopifyAdmin) {
    throw reactRouterRedirect(installUrl);
  } else {
    throw redirectWithAppBridgeHeaders(installUrl);
  }
}

function buildInstallUrl(
  params: BasicParams,
  shop: string,
  optionalScopes: string[] = [],
) {
  const baseInstallUrl = buildBaseInstallUrl(params, shop);
  baseInstallUrl.search = buildParamsInstallUrl(
    params,
    optionalScopes,
  ).toString();
  return baseInstallUrl.href;
}

function buildBaseInstallUrl({api}: BasicParams, shop: string) {
  const cleanShop = api.utils.sanitizeShop(shop, true);
  return new URL(`https://${cleanShop}/admin/oauth/install`);
}

function buildParamsInstallUrl(
  {config}: BasicParams,
  optionalScopes: string[] = [],
) {
  const optionalScopesParam =
    optionalScopes && optionalScopes.length > 0
      ? {optional_scopes: optionalScopes.join(',')}
      : undefined;

  const query = {
    client_id: config.apiKey,
    scope: config.scopes?.toString() || '',
    ...optionalScopesParam,
  };
  return new URLSearchParams(query);
}
