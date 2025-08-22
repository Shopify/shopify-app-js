import {AdminApiContext} from '../../../../clients';

export interface RevokeScopesResponse {
  revoked: {
    handle: string;
  }[];
  userErrors: {
    field: string;
    message: string;
  }[];
}

const REVOKE_SCOPE_MUTATION = `#graphql
mutation AppRevokeAccessScopes($scopes: [String!]!) {
  appRevokeAccessScopes(scopes: $scopes){
    revoked {
      handle
    }
    userErrors {
      field
      message
    }
  }
}`;

export async function revokeScopes(
  admin: AdminApiContext,
  scopes: string[],
): Promise<RevokeScopesResponse> {
  const revokeScopesResult = await admin.graphql(REVOKE_SCOPE_MUTATION, {
    variables: {
      scopes,
    },
  });

  const resultContent = await revokeScopesResult.json();
  return resultContent.data.appRevokeAccessScopes;
}
