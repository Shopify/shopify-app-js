import {Session} from '@shopify/shopify-api';

import {AppConfigArg} from '../../../config-types';
import {BasicParams} from '../../../types';
import {AdminApiContext} from '../../../clients';

import {ScopesApiContext} from './types';
import {requestScopesFactory} from './request';
import {queryScopesFactory} from './query';
import {revokeScopesFactory} from './revoke';

export function scopesApiFactory<ConfigArg extends AppConfigArg>(
  params: BasicParams,
  session: Session,
  admin: AdminApiContext<ConfigArg>,
): ScopesApiContext {
  return {
    query: queryScopesFactory(params, session, admin),
    request: requestScopesFactory(params, session, admin),
    revoke: revokeScopesFactory(params, session, admin),
  };
}
