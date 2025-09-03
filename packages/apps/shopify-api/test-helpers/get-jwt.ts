import {createSecretKey} from 'crypto';

import {SignJWT} from 'jose';

import {JwtPayload} from '../lib';

import {USER_ID} from './const';
import {getShopValue} from './get-shop-value';

interface TestJwt {
  token: string;
  payload: JwtPayload;
}

/**
 * Creates and signs a JWT token to use in faking authorization for testing.
 *
 * @param store The name of the store for which to create a valid JWT token.
 * @param apiKey The Client ID/API key for the store for which to create a valid JWT token.
 * @param apiSecretKey The API secret for the store for which to create a valid JWT token.
 * @param overrides Optional overrides for the JWT payload.
 * @returns {TestJwt} The JWT token and the JWT payload used to create the token.
 */
export async function getJwt(
  store: string,
  apiKey: string,
  apiSecretKey: string,
  overrides: Partial<JwtPayload> = {},
): Promise<TestJwt> {
  const date = new Date();
  const shop: string = getShopValue(store);
  const payload = {
    iss: `${shop}/admin`,
    dest: `https://${shop}`,
    aud: apiKey,
    sub: `${USER_ID}`,
    exp: date.getTime() / 1000 + 3600,
    nbf: date.getTime() / 1000 - 3600,
    iat: date.getTime() / 1000 - 3600,
    jti: '1234567890',
    sid: '0987654321',
    ...overrides,
  };
  const token = await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .sign(createSecretKey(Buffer.from(apiSecretKey)));

  return {token, payload};
}
