import {getOfflineSession} from '../../helpers';
import {SessionNotFoundError} from '../../errors';
import {BasicParams} from '../../types';
import {adminClientFactory} from '../../clients/admin';

import {UnauthenticatedAdminContext} from './types';

export function unauthenticatedAdminContextFactory(params: BasicParams) {
  return async (shop: string): Promise<UnauthenticatedAdminContext> => {
    const session = await getOfflineSession(params, shop);

    if (!session) {
      throw new SessionNotFoundError(
        `Could not find a session for shop ${shop} when creating unauthenticated admin context`,
      );
    }

    return {
      session,
      admin: adminClientFactory({params, session}),
    };
  };
}
