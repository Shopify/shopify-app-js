import {Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import type {BasicParams} from '../../../types';

import {GetAppId} from './types';

export function getRevokeFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  return async function revoke(scopes: string[]) {
    const {logger} = params;

    logger.debug('Revoking scopes: ', {
      shop: session.shop,
      ...{scopes},
    });

    return execute(admin, scopes);
  };
}

async function execute(admin: AdminApiContext, scopes: string[]) {
  const appId = await getAppId(admin);
  await admin.graphql(
    `#graphql
          mutation RevokeAccessScope($input: AppRevokeAccessScopesInput!) {
            appRevokeAccessScopes(input: $input){
              app {
                id
                optionalAccessScopes {
                  handle
                }
                installation {
                  accessScopes {
                    handle
                  }
                }
              }
            }
          }`,
    {
      variables: {
        input: {
          id: appId,
          scopes,
        },
      },
    },
  );

  return true;
}

// eslint-disable-next-line no-warning-comments
// TODO - Remove this fetch, why not using the accessToken or at least receiving this id as part of the token info.
async function getAppId(admin: AdminApiContext) {
  const scopesResponse = await admin.graphql(
    `#graphql
          query FetchAppId{
            app {
              id
            }
          }`,
  );

  const result = (await scopesResponse.json()).data as GetAppId;

  return result.app.id;
}
