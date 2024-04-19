import {redirect} from '../scopes/strategies/inline-redirection';
import {MissingScopesResponse} from '../scopes/types';

export function errorBoundary(error: any) {
  const missingScopesError = parseJsonError(error);
  if (missingScopesError) {
    return redirect(missingScopesError);
  }

  if (
    error.constructor.name === 'ErrorResponse' ||
    error.constructor.name === 'ErrorResponseImpl'
  ) {
    return (
      <div
        dangerouslySetInnerHTML={{__html: error.data || 'Handling response'}}
      />
    );
  }

  throw error;
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
