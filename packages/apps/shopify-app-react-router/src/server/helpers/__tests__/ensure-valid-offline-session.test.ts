import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {testConfig, TEST_SHOP} from '../../__test-helpers';
import {expectTokenRefresh} from '../../__test-helpers/expect-token-refresh';
import {deriveApi} from '../../shopify-app';
import {AppDistribution, BasicParams} from '../../types';
import {ensureValidOfflineSession} from '../ensure-valid-offline-session';
import {AppConfigArg} from '../../config-types';
import {FutureFlagOptions} from '../../future/flags';

describe('ensureValidOfflineSession', () => {
  let sessionStorage: MemorySessionStorage;
  let params: BasicParams;
  let mockRefreshToken: jest.Mock;

  describe('when no session exists', () => {
    beforeEach(() => {
      sessionStorage = new MemorySessionStorage();
      const config = testConfig({sessionStorage});

      mockRefreshToken = jest.fn();

      // Create api using deriveApi
      const api = deriveApi(config);

      // Create params with mocked api.auth.refreshToken
      params = {
        api: {
          ...api,
          auth: {
            ...api.auth,
            refreshToken: mockRefreshToken,
          },
        },
        config,
        logger: api.logger,
      } as unknown as BasicParams;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns undefined when session storage is empty', async () => {
      // GIVEN
      params.config.distribution = AppDistribution.AppStore;

      // WHEN
      const result = await ensureValidOfflineSession(params, TEST_SHOP);

      // THEN
      expect(result).toBeUndefined();
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('when session exists', () => {
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

      const result = await ensureValidOfflineSession(params, session.shop);
      if (!result) {
        throw new Error('Session not found');
      }
      return result;
    });
  });
});
