import {OnErrorOptions} from '../authenticate/admin/strategies/types';
import {OPTIONAL_SCOPES_HEADER} from '../authenticate/const';

import {redirect} from './strategies/inline-redirection';
import {MissingScopesResponse} from './types';

export async function handleScopesError({request, error}: OnErrorOptions) {
  if (
    error.message.includes('Required access') ||
    error.message.includes('Access denied for')
  ) {
    const optionalScopes = (
      request.headers.get(OPTIONAL_SCOPES_HEADER) ?? ''
    ).split(',');
    const responseContent: MissingScopesResponse = {
      type: 'missingScopes',
      data: {scopes: optionalScopes},
    };
    throw new Response(JSON.stringify(responseContent), {
      status: 500,
    });
  }
}

export function errorBoundaryFactory(redirectionType: 'inline' | 'modal') {
  return function onErrorBoundary(error: any) {
    const missingScopesError = parseJsonError(error);
    if (missingScopesError) {
      if (redirectionType === 'inline') return redirect(missingScopesError);
    }
    return error;
  };
}

export function onErrorBoundaryInline(error: any) {
  const missingScopesError = parseJsonError(error);
  if (missingScopesError) {
    return redirect(missingScopesError);
  }
  return error;
}

function parseJsonError(error: any): MissingScopesResponse | undefined {
  try {
    const data = JSON.parse(error.data);
    if (data.type === 'missingScopes' && data.data.scopes.length > 0) {
      return {type: 'missingScopes', data: data.data};
    }
  } catch {
    console.log('Error not JSON parsable');
  }
  return undefined;
}
