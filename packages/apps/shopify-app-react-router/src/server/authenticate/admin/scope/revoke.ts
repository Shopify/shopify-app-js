import {Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import type {BasicParams} from '../../../types';

import {revokeScopes} from './client/revoke-scopes';

export function revokeScopesFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  return async function revoke(scopes: string[]) {
    const {logger} = params;

    await validateScopes(scopes);

    logger.debug('Revoke scopes: ', {
      shop: session.shop,
      scopes,
    });

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

    return {
      revoked: revokeScopesResult.revoked.map((scope) => scope.handle),
    };
  };
}

async function validateScopes(scopes: string[]) {
  if (!scopes || scopes.length === 0) {
    throw new Response('No scopes provided', {status: 400});
  }
}
