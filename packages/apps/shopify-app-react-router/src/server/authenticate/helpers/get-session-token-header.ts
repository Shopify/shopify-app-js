const SESSION_TOKEN_PARAM = 'id_token';

export function getSessionTokenHeader(request: Request): string | undefined {
  return request.headers.get('authorization')?.replace('Bearer ', '');
}

export function getSessionTokenFromUrlParam(request: Request): string | null {
  const url = new URL(request.url);

  return url.searchParams.get(SESSION_TOKEN_PARAM);
}
