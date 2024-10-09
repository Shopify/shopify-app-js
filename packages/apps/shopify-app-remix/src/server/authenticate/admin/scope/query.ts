import {AuthScopes, Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import type {BasicParams} from '../../../types';

import {ScopesDetail} from './types';
import {
  FetchScopesDetailResponse,
  fetchScopeDetail,
} from './client/fetch-scopes-details';

export function queryScopesFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  return async function queryScopes() {
    const {logger} = params;

    logger.debug('Querying scopes details: ', {
      shop: session.shop,
    });

    const scopesDetail = await fetchScopeDetail(admin);
    return mapFetchScopeDetail(scopesDetail);
  };
}

export function mapFetchScopeDetail(
  scopesDetailResponse: FetchScopesDetailResponse,
): ScopesDetail {
  const appInformation = scopesDetailResponse.app;

  const granted = new AuthScopes(
    appInformation.installation.accessScopes.map((scope) => scope.handle),
  ).toArray(true);

  const required = new AuthScopes(
    appInformation.requestedAccessScopes.map((scope) => scope.handle),
  ).toArray(true);

  const optional = new AuthScopes(
    appInformation.optionalAccessScopes.map((scope) => scope.handle),
  ).toArray(true);

  // Remove any optional scopes that are also required
  // optional = optional.filter((scope) => !required.includes(scope));

  return {
    granted,
    required,
    optional,
  };
}
