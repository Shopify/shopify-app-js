import {Session} from '@shopify/shopify-api';

import {AdminApiContext} from '../../../clients';
import {BasicParams} from '../../../types';

import {getScopesFactory} from './get';
import {checkScopesFactory} from './check';

export function scopesApiFactory(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext,
) {
  const getScopes = getScopesFactory(params, session, admin);
  return {
    get: getScopes,
    check: checkScopesFactory(params, session, getScopes),
  };
}
