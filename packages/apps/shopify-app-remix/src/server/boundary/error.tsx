import {redirect} from '../scopes/strategies/inline-redirection';
import {MissingScopesResponse} from '../scopes/types';

export function errorBoundary(error: any, params: any) {
  const missingScopesError = parseJsonError(error);
  if (missingScopesError) {
    if (params && params.redirection === 'inline') {
      return redirect(missingScopesError);
    } else {
      <div dangerouslySetInnerHTML={{__html: missingScopesError}} />;
    }
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
