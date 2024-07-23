import {AuthScopes, Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import type {BasicParams} from '../../../types';

import {ScopesInformation} from './types';
import {
  FetchScopeInformationResponse,
  fetchScopeInformation,
} from './client/fetch-scopes-information';

export function queryScopesFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  return async function queryScopes() {
    const {logger} = params;

    logger.debug('Query scopes information: ', {
      shop: session.shop,
    });

    const scopesInformation = await fetchScopeInformation(admin);
    return mapFetchScopeInformation(scopesInformation);
  };
}

export function mapFetchScopeInformation(
  fetchScopeInformation: FetchScopeInformationResponse,
): ScopesInformation {
  const appInformation = fetchScopeInformation.app;
  const declaredRequired = new AuthScopes(
    appInformation.requestedAccessScopes.map((scope) => scope.handle),
  );

  const grantedRequired = appInformation.installation.accessScopes
    .map((scope) => scope.handle)
    .filter((scope) => declaredRequired.has(scope));

  const grantedOptional = appInformation.installation.accessScopes
    .map((scope) => scope.handle)
    .filter((scope) => !declaredRequired.has(scope));

  return {
    granted: {
      required: grantedRequired,
      optional: grantedOptional,
    },
    declared: {
      required: declaredRequired.toArray(),
    },
  };
}
