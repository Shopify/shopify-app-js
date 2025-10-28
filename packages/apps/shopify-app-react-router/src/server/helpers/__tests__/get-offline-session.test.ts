import {setUpValidSession as setUpValidSessionImport} from '@shopify/shopify-api/test-helpers';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {testConfig, TEST_SHOP} from '../../__test-helpers';
import {deriveApi} from '../../shopify-app';
import {AppDistribution, BasicParams} from '../../types';
import {getOfflineSession} from '../get-offline-session';

describe('getOfflineSession', () => {
  let sessionStorage: MemorySessionStorage;
  let params: BasicParams;
  let mockRefreshToken: jest.Mock;

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

  describe('when no session exists', () => {
    it('returns undefined when session storage is empty', async () => {
      // GIVEN
      // Session storage is empty (nothing stored)
      params.config.distribution = AppDistribution.AppStore;

      // WHEN
      const result = await getOfflineSession(params, TEST_SHOP);

      // THEN
      expect(result).toBeUndefined();
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('when session exists in storage', () => {
    describe('with feature flag disabled', () => {
      beforeEach(() => {
        params.config.future = {
          unstable_expiringOfflineAccessTokenSupport: false,
        };
      });

      it('returns the session without refreshing even if expired', async () => {
        // GIVEN
        // 5 seconds ago
        const expiredDate = new Date(Date.now() - 5000);
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'test-access-token',
        });

        await sessionStorage.storeSession(session);

        // WHEN
        const result = await getOfflineSession(params, TEST_SHOP);

        // THEN
        expect(result).toBeDefined();
        expect(result?.id).toBe(session.id);
        expect(result?.accessToken).toBe('test-access-token');
        expect(mockRefreshToken).not.toHaveBeenCalled();
      });

      it('returns the session when not expired', async () => {
        // GIVEN
        // 24 hours in future
        const futureDate = new Date(Date.now() + 86400000);
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: futureDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'test-access-token',
        });

        await sessionStorage.storeSession(session);

        // WHEN
        const result = await getOfflineSession(params, TEST_SHOP);

        // THEN
        expect(result).toBeDefined();
        expect(result?.id).toBe(session.id);
        expect(result?.accessToken).toBe('test-access-token');
        expect(mockRefreshToken).not.toHaveBeenCalled();
      });
    });

    describe('with feature flag enabled', () => {
      beforeEach(() => {
        params.config.future = {
          unstable_expiringOfflineAccessTokenSupport: true,
        };
      });

      it('returns the session without refreshing when not expired', async () => {
        // GIVEN
        // 24 hours in future
        const futureDate = new Date(Date.now() + 86400000);
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: futureDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
          accessToken: 'test-access-token',
        });

        await sessionStorage.storeSession(session);

        // WHEN
        const result = await getOfflineSession(params, TEST_SHOP);

        // THEN
        expect(result).toBeDefined();
        expect(result?.id).toBe(session.id);
        expect(result?.accessToken).toBe('test-access-token');
        expect(mockRefreshToken).not.toHaveBeenCalled();
      });

      it('refreshes and returns new session when expired', async () => {
        // GIVEN
        const expiredDate = new Date(Date.now() - 5000);
        const oldSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'old-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });

        const newSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 86400000),
          refreshToken: 'new-refresh-token',
          isOnline: false,
          accessToken: 'new-access-token',
        });

        await sessionStorage.storeSession(oldSession);
        mockRefreshToken.mockResolvedValue({session: newSession});
        params.config.distribution = AppDistribution.AppStore;

        // WHEN
        const result = await getOfflineSession(params, TEST_SHOP);

        // THEN
        expect(result).toBeDefined();
        expect(result?.accessToken).toBe('new-access-token');
        expect(result?.refreshToken).toBe('new-refresh-token');
        expect(mockRefreshToken).toHaveBeenCalledWith({
          shop: TEST_SHOP,
          refreshToken: 'old-refresh-token',
        });

        // Verify new session was stored
        const storedSession = await sessionStorage.loadSession(newSession.id);
        expect(storedSession).toEqual(newSession);
      });

      it('refreshes session when expires within threshold', async () => {
        // GIVEN
        // 900ms from now
        const almostExpiredDate = new Date(Date.now() + 900);
        const oldSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: almostExpiredDate,
          refreshToken: 'old-refresh-token',
          isOnline: false,
        });

        const newSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 86400000),
          refreshToken: 'new-refresh-token',
          isOnline: false,
        });

        await sessionStorage.storeSession(oldSession);
        mockRefreshToken.mockResolvedValue({session: newSession});

        // WHEN
        const result = await getOfflineSession(params, TEST_SHOP);

        // THEN
        expect(result).toBeDefined();
        expect(result?.refreshToken).toBe('new-refresh-token');
        expect(mockRefreshToken).toHaveBeenCalledWith({
          shop: TEST_SHOP,
          refreshToken: 'old-refresh-token',
        });
      });
    });
  });
  describe('edge cases', () => {
    beforeEach(() => {
      params.config.future = {
        unstable_expiringOfflineAccessTokenSupport: true,
      };
    });

    it('handles session with undefined expires', async () => {
      // GIVEN
      const session = setUpValidSessionImport({
        shop: TEST_SHOP,
        expires: undefined,
        refreshToken: 'test-refresh-token',
        isOnline: false,
      });

      await sessionStorage.storeSession(session);

      // WHEN
      const result = await getOfflineSession(params, TEST_SHOP);

      // THEN
      expect(result).toBeDefined();
      expect(result?.id).toBe(session.id);
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });

    it('propagates errors from refresh token operation', async () => {
      // GIVEN
      const expiredDate = new Date(Date.now() - 5000);
      const session = setUpValidSessionImport({
        shop: TEST_SHOP,
        expires: expiredDate,
        refreshToken: 'invalid-refresh-token',
        isOnline: false,
      });

      await sessionStorage.storeSession(session);
      const refreshError = new Error('Refresh token is invalid');
      mockRefreshToken.mockRejectedValue(refreshError);

      // WHEN & THEN
      await expect(getOfflineSession(params, TEST_SHOP)).rejects.toBeInstanceOf(
        Response,
      );
    });
  });
});
