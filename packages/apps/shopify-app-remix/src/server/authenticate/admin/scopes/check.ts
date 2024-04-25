import {Session, AuthScopes} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';

export function checkScopesFactory(
  params: BasicParams,
  session: Session,
  getScopes: (forceRemote: boolean) => Promise<string[]>,
) {
  return async function checkScopes(scopes: string[], forceRemote = false) {
    const {logger} = params;

    logger.debug('Checkings scopes: ', {
      shop: session.shop,
      ...{scopes, forceRemote},
    });

    const installedScopes = await getScopes(forceRemote);

    const installedScopesSet = new AuthScopes(installedScopes);
    const scopesToCheckSet = new AuthScopes(scopes);

    return installedScopesSet.notIncluded(scopesToCheckSet);
  };
}
