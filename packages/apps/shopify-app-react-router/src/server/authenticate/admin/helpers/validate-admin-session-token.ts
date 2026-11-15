import {JwtPayload} from '@shopify/shopify-api';

import {BasicParams} from '../../../types';
import {validateSessionToken} from '../../helpers/validate-session-token';
import {respondToInvalidSessionToken} from '../../helpers/respond-to-invalid-session-token';

export async function validateAdminSessionToken(
  params: BasicParams,
  request: Request,
  token: string,
): Promise<{payload: JwtPayload; shop: string}> {
  const payload = await validateSessionToken(params, request, token);

  if (
    typeof payload.dest !== 'string' ||
    typeof payload.iss !== 'string' ||
    !URL.canParse(payload.dest)
  ) {
    throw respondToInvalidSessionToken({params, request});
  }

  const destination = new URL(payload.dest);
  if (
    destination.protocol !== 'https:' ||
    (payload.dest !== destination.origin &&
      payload.dest !== `${destination.origin}/`) ||
    (payload.iss !== `${destination.origin}/admin` &&
      payload.iss !== `${destination.host}/admin`)
  ) {
    throw respondToInvalidSessionToken({params, request});
  }

  return {payload, shop: destination.hostname};
}
