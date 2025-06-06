import {LogSeverity, ShopifyRestResources} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';
import {
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
} from '@shopify/shopify-api/test-helpers';

import type {AppConfigArg} from '../config-types';
import type {FutureFlagOptions} from '../future/flags';

const TEST_CONFIG = {
  apiKey: API_KEY,
  apiSecretKey: API_SECRET_KEY,
  scopes: ['testScope'] as any,
  appUrl: APP_URL,
  adminApiAccessToken: API_KEY,
  privateAppStorefrontAccessToken: API_KEY,
  logger: {
    level: LogSeverity.Debug,
  },
  sessionStorage: new MemorySessionStorage(),
  isTesting: true,
} as const;

export function testConfig<
  Overrides extends TestOverridesArg,
  Future extends FutureFlagOptions,
>(
  {future, ...overrides}: Overrides & {future?: Future} = {} as Overrides & {
    future?: Future;
  },
): TestConfig<Overrides> {
  return {
    ...TEST_CONFIG,
    ...overrides,
    logger: {
      ...TEST_CONFIG.logger,
      ...(overrides as NonNullable<Overrides>).logger,
    },
    future,
  } as any;
}

/*
 * This type combines both passed in types, by ignoring any keys from Type1 that are present (and not undefined)
 * in Type2, and then adding any keys from Type1 that are not present in Type2.
 *
 * This effectively enables us to create a type that is the const TEST_CONFIG below, plus any overrides passed in with
 * the output being a const object.
 */
type Modify<Type1, Type2> = {
  [key in keyof Type2 as Type2[key] extends undefined
    ? never
    : key]: Type2[key];
} & {
  [key in keyof Type1 as key extends keyof Type2 ? never : key]: Type1[key];
};

/*
 * We omit the future prop and then redefine it with a partial of that object so we can pass the fully typed object in
 * to AppConfigArg.
 */
type TestOverrides = Partial<
  Omit<
    AppConfigArg<ShopifyRestResources, SessionStorage, FutureFlagOptions>,
    'future'
  > & {
    future: Partial<FutureFlagOptions>;
  }
>;

export type TestOverridesArg = undefined | TestOverrides;

export type TestConfig<Overrides extends TestOverridesArg> = Modify<
  typeof TEST_CONFIG,
  Overrides
> & {
  future: FutureFlagOptions;
  logger: AppConfigArg['logger'];
};
