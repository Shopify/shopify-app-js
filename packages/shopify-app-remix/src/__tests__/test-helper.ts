import '@shopify/shopify-api/adapters/web-api';

import {LATEST_API_VERSION, LogSeverity} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {AppConfigArg} from '../server/config-types';

export const API_SECRET_KEY = 'testApiSecretKey';
export const API_KEY = 'testApiKey';
export const APP_URL = 'https://my-test-app.myshopify.io';
export const SHOPIFY_HOST = 'totally-real-host.myshopify.io';
export const BASE64_HOST = Buffer.from(SHOPIFY_HOST).toString('base64');
export const TEST_SHOP = 'test-shop.myshopify.com';
export const GRAPHQL_URL = `https://${TEST_SHOP}/admin/api/${LATEST_API_VERSION}/graphql.json`;

export function testConfig(
  overrides: Partial<AppConfigArg> = {},
): AppConfigArg & {sessionStorage: SessionStorage} {
  return {
    apiKey: API_KEY,
    apiSecretKey: API_SECRET_KEY,
    scopes: ['testScope'],
    apiVersion: LATEST_API_VERSION,
    appUrl: APP_URL,
    logger: {
      log: jest.fn(),
      level: LogSeverity.Debug,
    },
    isEmbeddedApp: true,
    sessionStorage: new MemorySessionStorage(),
    ...overrides,
  };
}
