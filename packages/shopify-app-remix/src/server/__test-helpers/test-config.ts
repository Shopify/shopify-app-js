import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {LATEST_API_VERSION, LogSeverity} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {AppConfigArg} from '../config-types';

import {API_KEY, API_SECRET_KEY, APP_URL} from './const';

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
