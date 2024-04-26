import {Session} from '@shopify/shopify-api';
import {redirect as remixRedirect} from '@remix-run/server-runtime';

import type {BasicParams} from '../../../types';

export function requestScopesFactory(
  params: BasicParams,
  session: Session,
  check: (scopes: string[], forceRemote?: boolean) => Promise<string[]>,
) {
  return async function requestScopes(scopes: string[]) {
    const {logger} = params;

    logger.debug('Request scopes: ', {
      shop: session.shop,
      ...{scopes},
    });

    const missingScopes = await check(scopes);
    if (missingScopes.length > 0) {
      throw remixRedirect(
        `${params.config.optionalScopes.path}/request?scopes=${missingScopes.join(',')}`,
      );
    }

    return undefined;
  };
}
