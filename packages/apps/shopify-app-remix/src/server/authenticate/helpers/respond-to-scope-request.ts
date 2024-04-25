import {AppConfigArg} from 'src/server/config-types';

import {ScopesApiContext} from '../admin/scopes/types';
import {OPTIONAL_SCOPES_HEADER} from '../const';

export async function addScopesToErrorHandling(
  optionalScopes: string[],
  request: Request,
) {
  const scopes =
    optionalScopes.length > 0 ? optionalScopes.join(',') : undefined;
  if (scopes) request.headers.append(OPTIONAL_SCOPES_HEADER, scopes);
}

export async function respondToScopeRequest(
  request: Request,
  config: AppConfigArg,
  api?: ScopesApiContext,
): Promise<string[]> | never {
  const url = new URL(request.url);

  const path = (path: string) => `${config.optionalScopes.path}/${path}`;

  switch (url.pathname) {
    case path('request'):
      return url.searchParams.get('scopes')?.split(',') ?? [];
    case path('check'):
      await check(url, api);
  }

  return [];
}

async function check(url: URL, api?: ScopesApiContext) {
  if (!api) return;
  const scopes = url.searchParams.get('scopes')?.split(',') ?? [];

  const missingScopes = await api.check(scopes);

  throw buildJsonResponse({missingScopes});
}

function buildJsonResponse(content: object, status = 200) {
  return new Response(JSON.stringify(content), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
