import {JwtPayload} from '@shopify/shopify-api';
import {getJwt as getJwtImport} from '@shopify/shopify-api/test-helpers';

import {API_KEY, API_SECRET_KEY, TEST_SHOP_NAME} from './const';

export async function getJwt(
  overrides: Partial<JwtPayload> = {},
): Promise<ReturnType<typeof getJwtImport>> {
  return getJwtImport(TEST_SHOP_NAME, API_KEY, API_SECRET_KEY, overrides);
}
