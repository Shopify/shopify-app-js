import {JwtPayload} from '@shopify/shopify-api';
import jwt from 'jsonwebtoken';

import {API_KEY, API_SECRET_KEY, TEST_SHOP, USER_ID} from './const';

interface TestJwt {
  token: string;
  payload: JwtPayload;
}

export function getJwt(overrides: Partial<JwtPayload> = {}): TestJwt {
  const date = new Date();
  const payload = {
    iss: `${TEST_SHOP}/admin`,
    dest: `https://${TEST_SHOP}`,
    aud: API_KEY,
    sub: `${USER_ID}`,
    exp: date.getTime() / 1000 + 3600,
    nbf: date.getTime() / 1000 - 3600,
    iat: date.getTime() / 1000 - 3600,
    jti: '1234567890',
    sid: '0987654321',
    ...overrides,
  };

  const token = jwt.sign(payload, API_SECRET_KEY, {
    algorithm: 'HS256',
  });

  return {token, payload};
}
