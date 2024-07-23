import {AppConfigArg} from '../../config-types';
import {ScopesApiContext} from '../admin/scope/types';

export async function respondToScopeRequest(
  request: Request,
  config: AppConfigArg,
  scopesApi: ScopesApiContext,
): Promise<undefined> | never {
  if (!config.future?.unstable_optionalScopesApi) {
    throw new Response(undefined, {status: 404});
  }

  const url = new URL(request.url);

  const path = (path: string) => `${config.authPathPrefix}/scopes/${path}`;

  switch (url.pathname) {
    case path('request'):
      await requestScopes(url, scopesApi);
      break;
    case path('query'):
      await query(scopesApi);
      break;
    case path('revoke'):
      await revoke(url, scopesApi);
      break;
  }
}

async function query(api: ScopesApiContext) {
  const scopesInformation = await api.query();

  throw buildJsonResponse({...scopesInformation});
}

async function revoke(url: URL, api: ScopesApiContext) {
  const scopes = url.searchParams.get('scopes')?.split(',') ?? [];

  const scopesInformation = await api.revoke(scopes);
  throw buildJsonResponse({...scopesInformation});
}

async function requestScopes(url: URL, api: ScopesApiContext) {
  const scopes = url.searchParams.get('scopes')?.split(',') ?? [];

  await api.request(scopes);
}

function buildJsonResponse(content?: object, status = 200) {
  return new Response(content ? JSON.stringify(content) : undefined, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
