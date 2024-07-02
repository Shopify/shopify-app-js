import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../../types';

import {ScopesApiContext} from './types';
import {requestScopesFactory} from './request';

export function scopesApiFactory(
  params: BasicParams,
  session: Session,
): ScopesApiContext {
  return {
    request: requestScopesFactory(params, session),
  };
}
