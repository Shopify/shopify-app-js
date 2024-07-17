import {AdminApiContext} from '../../../../clients';

export interface FetchScopeInformationResponse {
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

const FETCH_SCOPE_INFORMATION_QUERY = `#graphql
query FetchAccessScopes{
  app {
    requestedAccessScopes {
      handle
    }
    installation {
      accessScopes {
        handle
      }
    }
  }
}`;

export async function fetchScopeInformation(admin: AdminApiContext) {
  const fetchScopeInformationResult = await admin.graphql(
    FETCH_SCOPE_INFORMATION_QUERY,
  );

  return (await fetchScopeInformationResult.json())
    .data as FetchScopeInformationResponse;
}
