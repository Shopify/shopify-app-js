import {AuthScopes, Session} from '@shopify/shopify-api';

import {AppConfigArg} from '../../../config-types';
import type {BasicParams} from '../../../types';
import {redirectToInstallPage} from '../helpers/redirect-to-install-page';
import {AdminApiContext} from '../../../clients';

import {fetchScopeDetail} from './client/fetch-scopes-details';

export function requestScopesFactory<ConfigArg extends AppConfigArg>(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext<ConfigArg>,
) {
  return async function requestScopes(scopes: string[]) {
    const {logger} = params;

    logger.debug('Requesting optional scopes: ', {shop: session.shop, scopes});

    if (scopes.length === 0) return;
    if (await alreadyGranted(scopes, admin)) return;

    throw await redirectToInstallPage(params, session.shop, scopes);
  };

  async function alreadyGranted(
    scopes: string[],
    admin: AdminApiContext<ConfigArg>,
  ) {
    const scopesDetail = await fetchScopeDetail(admin);
    const grantedScopes = scopesDetail.app.installation.accessScopes.map(
      (scope) => scope.handle,
    );
    return new AuthScopes(grantedScopes).has(scopes);
  }
}
