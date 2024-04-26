import {Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import {BasicParams} from '../../../types';

import {getScopesFactory} from './get';
import {checkScopesFactory} from './check';
import {getRevokeFactory} from './revoke';
import {ScopesApiContext} from './types';
import {requestScopesFactory} from './request';

export function scopesApiFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
): ScopesApiContext {
  const getScopes = getScopesFactory(params, session, admin);
  const checkScopes = checkScopesFactory(params, session, getScopes);
  return {
    get: getScopes,
    check: checkScopes,
    revoke: getRevokeFactory(params, session, admin),
    request: requestScopesFactory(params, session, checkScopes),
  };
}
