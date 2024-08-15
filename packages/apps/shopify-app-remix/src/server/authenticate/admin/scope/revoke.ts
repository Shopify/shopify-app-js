import {Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import type {BasicParams} from '../../../types';

import {revokeScopes} from './client/revoke-scopes';
import {fetchScopeDetail} from './client/fetch-scopes-details';
import {mapFetchScopeDetail} from './query';

export function revokeScopesFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  return async function revoke(scopes: string[]) {
    const {logger} = params;

    logger.debug('Revoke scopes: ', {
      shop: session.shop,
      scopes,
    });

    await validateScopes(scopes);

    const revokeScopesResult = await revokeScopes(admin, scopes);
    if (revokeScopesResult.userErrors?.length > 0) {
      logger.error('Failed to revoke scopes: ', {
        shop: session.shop,
        errors: revokeScopesResult.userErrors,
      });

      throw new Response(JSON.stringify(revokeScopesResult.userErrors), {
        status: 422,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const scopesDetail = await fetchScopeDetail(admin);
    return {
      detail: mapFetchScopeDetail(scopesDetail),
    };
  };
}

async function validateScopes(scopes: string[]) {
  if (!scopes || scopes.length === 0) {
    throw new Response('No scopes provided', {status: 400});
  }
}
