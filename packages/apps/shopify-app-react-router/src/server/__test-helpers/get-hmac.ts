import {getHmac as getHmacImport} from '@shopify/shopify-api/test-helpers';

import {API_SECRET_KEY} from './const';

export function getHmac(body: string): string {
  return getHmacImport(body, API_SECRET_KEY);
}
