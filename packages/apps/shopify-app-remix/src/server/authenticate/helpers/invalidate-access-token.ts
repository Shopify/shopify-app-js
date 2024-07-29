import {Session} from '@shopify/shopify-api';

import type {BasicParams} from '../../types';

export async function invalidateAccessToken(
  params: BasicParams,
  session: Session,
): Promise<void> {
  const {logger, config} = params;

  logger.debug(`Invalidating access token for session - ${session.id}`);

  session.accessToken = undefined;
  await config.sessionStorage!.storeSession(session);
}
