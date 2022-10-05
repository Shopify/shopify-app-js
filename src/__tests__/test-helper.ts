import {LATEST_API_VERSION} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-api/session-storage/memory';

import {ConfigParams} from '../types';

export const testConfig: ConfigParams = {
  apiKey: 'testApiKey',
  apiSecretKey: 'testApiSecretKey',
  scopes: ['testScope'],
  apiVersion: LATEST_API_VERSION,
  hostName: 'my-test-shop.myshopify.io',
  sessionStorage: new MemorySessionStorage(),
};
