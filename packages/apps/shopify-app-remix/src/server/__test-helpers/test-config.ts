import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {testConfig as testConfigImport} from '../test-helpers/test-config';
import type {TestOverridesArg, TestConfig} from '../test-helpers/test-config';
import type {FutureFlags, FutureFlagOptions} from '../future/flags';

/*
 * This object mandates that all existing future flags be activated for tests. If a new flag is added, this object must
 * be updated to include it, which will also cause all tests to use the new behaviour by default (and likely fail).
 *
 * This way, we'll always ensure our tests are covering all future flags. Please make sure to also have tests for the
 * old behaviour.
 */
const TEST_FUTURE_FLAGS: Required<{[key in keyof FutureFlags]: true}> = {
  unstable_newEmbeddedAuthStrategy: true,
  wip_optionalScopesApi: true,
} as const;

const TEST_CONFIG = {
  logger: {
    log: jest.fn(),
  },
};

// Reset the config object before each test
beforeEach(() => {
  TEST_CONFIG.logger.log.mockReset();
  (TEST_CONFIG as any).sessionStorage = new MemorySessionStorage();
});

export function testConfig<
  Overrides extends TestOverridesArg,
  Future extends FutureFlagOptions,
>(
  {future, ...overrides}: Overrides & {future?: Future} = {} as Overrides & {
    future?: Future;
  },
): TestConfig<Overrides> {
  return testConfigImport({
    future: {
      ...TEST_FUTURE_FLAGS,
      ...future,
    },
    ...TEST_CONFIG,
    ...overrides,
  }) as any;
}
