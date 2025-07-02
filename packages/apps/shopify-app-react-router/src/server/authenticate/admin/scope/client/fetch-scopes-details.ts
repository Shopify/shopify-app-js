import {AdminApiContext} from '../../../../clients';

export interface FetchScopesDetailResponse {
  app: {
    requestedAccessScopes: {
      handle: string;
    }[];
    optionalAccessScopes: {
      handle: string;
    }[];
    installation: {
      accessScopes: {
        handle: string;
      }[];
    };
  };
}

const FETCH_SCOPES_DETAIL_QUERY = `#graphql
query FetchAccessScopes{
  app {
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
}`;

export async function fetchScopeDetail(
  admin: AdminApiContext,
): Promise<FetchScopesDetailResponse> {
  const fetchScopeDetailResult = await admin.graphql(FETCH_SCOPES_DETAIL_QUERY);

  const resultContent = await fetchScopeDetailResult.json();
  return resultContent.data;
}
