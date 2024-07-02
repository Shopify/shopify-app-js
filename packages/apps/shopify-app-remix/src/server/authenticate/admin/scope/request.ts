import {Session} from '@shopify/shopify-api';

import type {BasicParams} from '../../../types';
import {redirectToInstallPage} from '../helpers/redirect-to-install-page';

export function requestScopesFactory(params: BasicParams, session: Session) {
  return async function requestScopes(scopes: string[]) {
    const {logger} = params;

    logger.debug('Request optional scopes: ', {
      shop: session.shop,
      ...{scopes},
    });

    if (scopes.length === 0) return;

    throw await redirectToInstallPage(params, session.shop, scopes);
  };
}
