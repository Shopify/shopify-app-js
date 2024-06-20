import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../../types';

import {ScopesApiContext} from './types';
import {requestScopesFactory} from './request';

export function scopesApiFactory(
  params: BasicParams,
  session: Session,
): ScopesApiContext {
  if (!params.config.future.unstable_optionalScopesApi) {
    return disabledScopesApi();
  }
  return {
    request: requestScopesFactory(params, session),
  };
}

function disabledScopesApi() {
  return {
    request: disabledScopesApiError,
  };
}

async function disabledScopesApiError() {
  throw new Error(
    'Scopes API is disabled. Please enable the unstable_optionalScopesApi future flag.',
  );
}
