import {jwtVerify, type JWTPayload} from 'jose';

import type {
  IdTokenInput,
  TokenExchangeInput,
  TokenExchangeResult,
  TokenExchangeRuntime,
} from './types';

export type {
  IdTokenInput,
  TokenExchangeInput,
  TokenExchangeResult,
  TokenExchangeRuntime,
} from './types';

export class IdTokenVerificationError extends Error {
  constructor(
    readonly reason: 'invalid_token' | 'invalid_audience',
    message: string,
  ) {
    super(message);
    this.name = 'IdTokenVerificationError';
  }
}

export async function verifyIdToken({
  token,
  clientId,
  secretKey,
  checkAudience = true,
}: IdTokenInput): Promise<JWTPayload> {
  let payload: JWTPayload;
  try {
    ({payload} = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
      clockTolerance: 10,
    }));
  } catch (error) {
    const message =
      error !== null && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : String(error);
    throw new IdTokenVerificationError('invalid_token', message);
  }
  if (checkAudience && payload.aud !== clientId) {
    throw new IdTokenVerificationError('invalid_audience', 'Invalid audience');
  }
  return payload;
}

export async function exchangeToken<T>(
  input: TokenExchangeInput,
  runtime: TokenExchangeRuntime,
): Promise<TokenExchangeResult<T>> {
  await verifyIdToken({...input, checkAudience: true});
  const shop = runtime.validateShop(input.shop);
  const response = await runtime.fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({
        client_id: input.clientId,
        client_secret: input.clientSecret,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: input.token,
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
        requested_token_type: input.requestedTokenType,
        expiring: input.expiring ? '1' : '0',
      }),
    },
  );
  const body = await response.json();
  return response.ok
    ? {ok: true, shop, response, body: body as T}
    : {ok: false, shop, response, body};
}
