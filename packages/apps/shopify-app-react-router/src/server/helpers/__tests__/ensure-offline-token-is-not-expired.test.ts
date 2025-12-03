import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {testConfig} from '../../__test-helpers';
import {expectTokenRefresh} from '../../__test-helpers/expect-token-refresh';
import {AppConfigArg} from '../../config-types';
import {deriveApi} from '../../shopify-app';
import {BasicParams} from '../../types';
import {
  ensureOfflineTokenIsNotExpired,
  WITHIN_MILLISECONDS_OF_EXPIRY,
} from '../ensure-offline-token-is-not-expired';
import {FutureFlagOptions} from '../../future/flags';

describe('ensureOfflineTokenIsNotExpired', () => {
  it('uses 5 minutes for WITHIN_MILLISECONDS_OF_EXPIRY', async () => {
    expect(WITHIN_MILLISECONDS_OF_EXPIRY).toBe(5 * 60 * 1000);
  });
  expectTokenRefresh(async (sessionStorage, session, configOverrides) => {
    const config = testConfig({
      sessionStorage,
      ...configOverrides,
    }) as AppConfigArg<SessionStorage, FutureFlagOptions>;
    const api = deriveApi(config);
    const params = {
      api,
      config,
      logger: api.logger,
    } as unknown as BasicParams;

    return ensureOfflineTokenIsNotExpired(session, params, session.shop);
  });
});
