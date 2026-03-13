import {
  HttpResponseError,
  InvalidJwtError,
  Session,
  Shopify,
} from '@shopify/shopify-api';

export default async function refreshToken(
  api: Shopify,
  shop: string,
  refreshTokenValue: string,
): Promise<Session> {
  try {
    const {session} = await api.auth.refreshToken({
      shop,
      refreshToken: refreshTokenValue,
    });
    return session;
  } catch (error) {
    if (
      error instanceof InvalidJwtError ||
      (error instanceof HttpResponseError &&
        error.response.code === 400 &&
        error.response.body?.error === 'invalid_subject_token')
    ) {
      // re-throw; callers handle these specifically
      throw error;
    }
    throw new Error('Internal Server Error');
  }
}
