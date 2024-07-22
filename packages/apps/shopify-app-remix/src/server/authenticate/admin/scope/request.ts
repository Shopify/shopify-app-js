import {AuthScopes, Session} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {redirectToInstallPage} from '../helpers/redirect-to-install-page';
import {AdminApiContext} from '../../../clients';

import {fetchScopeInformation} from './client/fetch-scopes-information';

export function requestScopesFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  return async function requestScopes(scopes: string[]) {
    const {logger} = params;

    logger.debug('Request optional scopes: ', {
      shop: session.shop,
      ...{scopes},
    });

    if (scopes.length === 0) return;
    if (await alreadyGranted(scopes, admin)) return;

    throw await redirectToInstallPage(params, session.shop, scopes);
  };

  async function alreadyGranted(scopes: string[], admin: AdminApiContext) {
    const scopesInformation = await fetchScopeInformation(admin);
    const grantedScopes = scopesInformation.app.installation.accessScopes.map(
      (scope) => scope.handle,
    );
    return new AuthScopes(grantedScopes).has(scopes);
  }
}
