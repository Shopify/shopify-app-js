import {AuthScopes, Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import type {BasicParams} from '../../../types';

import {GetResponse} from './types';

export function getScopesFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  return async function getScopes(forceRemote = false) {
    const {logger} = params;

    logger.debug('Get current installed scopes: ', {
      shop: session.shop,
      ...{forceRemote},
    });

    if (session && session.isScopesExpired()) {
      const installedScopes = await getInstalledRemoteScopes(admin);
      const installedScopesSet = new AuthScopes(installedScopes);
      // eslint-disable-next-line require-atomic-updates
      session.scope = installedScopesSet.toArray().join(',');
      // eslint-disable-next-line require-atomic-updates
      session.scopesUpdated = new Date();
      params.config.sessionStorage.storeSession(session);
      logger.info('Scopes cache updated');
    }

    return session.scope?.split(',') ?? [];
  };
}

async function getInstalledRemoteScopes(admin: AdminApiContext) {
  const scopesResponse = await admin.graphql(
    `#graphql
        query FetchAccessScopes{
          app {
            id
            requestedAccessScopes {
              handle
            }
            optionalAccessScopes {
              handle
            }
            installation {
              accessScopes {
                handle
              }
            }
          }
        }`,
  );

  const scopesResult = (await scopesResponse.json()).data as GetResponse;

  return (
    scopesResult.app?.installation?.accessScopes.map((scope) => scope.handle) ??
    []
  );
}
