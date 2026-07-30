import {Request} from 'express';

const SESSION_TOKEN_PARAM = 'id_token';

export function getSessionTokenHeader(req: Request): string | undefined {
  return req.headers.authorization?.match(/Bearer (.*)/)?.[1];
}

export function getSessionTokenFromUrlParam(req: Request): string | undefined {
  return req.query[SESSION_TOKEN_PARAM] as string | undefined;
}

export function getSessionToken(req: Request): string | undefined {
  return getSessionTokenHeader(req) ?? getSessionTokenFromUrlParam(req);
}
