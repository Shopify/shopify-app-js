import {LATEST_API_VERSION, LogSeverity} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import type {AppConfigArg} from '../config-types';
import type {FutureFlags} from '../future/flags';

import {API_KEY, API_SECRET_KEY, APP_URL} from './const';

type DefaultedFutureFlag<
  Overrides extends Partial<AppConfigArg>,
  Flag extends keyof FutureFlags,
> = Overrides['future'] extends FutureFlags ? Overrides['future'][Flag] : true;

type TestConfig<Overrides extends Partial<AppConfigArg>> =
  // We omit billing so we use the actual values when set, rather than the generic type
  Omit<AppConfigArg, 'billing'> &
    Overrides & {
      // Create an object with all future flags defaulted to active to ensure our tests are updated when we introduce new flags
      future: {
        v3_authenticatePublic: DefaultedFutureFlag<
          Overrides,
          'v3_authenticatePublic'
        >;
        v3_webhookAdminContext: DefaultedFutureFlag<
          Overrides,
          'v3_webhookAdminContext'
        >;
      };
    };

export function testConfig<Overrides extends Partial<AppConfigArg>>(
  overrides: Overrides = {} as Overrides,
): TestConfig<Overrides> {
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
    future: {
      v3_webhookAdminContext: true,
      v3_authenticatePublic: true,
      ...(overrides.future as Overrides['future']),
    },
  };
}
