import {MissingScopesResponse} from '../types';

export function redirect(error: MissingScopesResponse) {
  return (
    <div>
      <meta
        httpEquiv="refresh"
        content={`0;url=/auth/scopes/request?scopes=${error.data.scopes.join(',')}`}
      />
    </div>
  );
}
