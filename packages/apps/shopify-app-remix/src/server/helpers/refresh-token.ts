import {
  HttpResponseError,
  InvalidJwtError,
  Session,
} from '@shopify/shopify-api';

import {BasicParams} from '../types';

// Preserve the existing HTTP response for other authentication flows while
// allowing webhook authentication to identify an unusable refresh token.
export class InvalidRefreshTokenResponse extends Response {
  constructor() {
    super(undefined, {status: 500, statusText: 'Internal Server Error'});
  }
}

export default async function refreshToken(
  params: BasicParams,
  shop: string,
  refreshToken: string,
): Promise<Session> {
  const {api} = params;
  try {
    const {session} = await api.auth.refreshToken({
      shop,
      refreshToken,
    });
    return session;
  } catch (error) {
    if (
      error instanceof InvalidJwtError ||
      (error instanceof HttpResponseError &&
        error.response.code === 400 &&
        error.response.body?.error === 'invalid_subject_token')
    ) {
      throw error;
    }
    if (
      error instanceof HttpResponseError &&
      error.response.code === 401 &&
      error.response.body?.error === 'invalid_request'
    ) {
      throw new InvalidRefreshTokenResponse();
    }
    throw new Response(undefined, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
