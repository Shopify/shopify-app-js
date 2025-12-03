import {
  HttpResponseError,
  InvalidJwtError,
  Session,
} from '@shopify/shopify-api';

import {BasicParams} from '../types';

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
    throw new Response(undefined, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
