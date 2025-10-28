import {setUpValidSession as setUpValidSessionImport} from '@shopify/shopify-api/test-helpers';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {testConfig, TEST_SHOP} from '../../__test-helpers';
import {deriveApi} from '../../shopify-app';
import {AppDistribution, BasicParams} from '../../types';
import {ensureOfflineTokenIsNotExpired} from '../../authenticate/helpers/ensure-offline-token-is-not-expired';

const WITHIN_MILLISECONDS_OF_EXPIRY = 1000;

describe('ensureOfflineTokenIsNotExpired', () => {
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

  describe('when feature flag is disabled', () => {
    it('returns the original session without refreshing when token is expired', async () => {
      // GIVEN
      // 5 seconds ago
      const expiredDate = new Date(Date.now() - 5000);
      const session = setUpValidSessionImport({
        shop: TEST_SHOP,
        expires: expiredDate,
        refreshToken: 'test-refresh-token',
        isOnline: false,
      });

      params.config.future = {
        unstable_expiringOfflineAccessTokenSupport: false,
      };

      // WHEN
      const result = await ensureOfflineTokenIsNotExpired(
        session,
        params,
        TEST_SHOP,
      );

      // THEN
      expect(result).toBe(session);
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('when feature flag is enabled', () => {
    beforeEach(() => {
      params.config.future = {
        unstable_expiringOfflineAccessTokenSupport: true,
      };
    });

    describe('when session is not expired', () => {
      it('returns the original session without refreshing', async () => {
        // GIVEN
        // 10 seconds in future
        const futureDate = new Date(Date.now() + 10000);
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: futureDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
        });

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          session,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(result).toBe(session);
        expect(mockRefreshToken).not.toHaveBeenCalled();
      });

      it('returns the original session when expires is exactly at the threshold', async () => {
        // GIVEN
        const thresholdDate = new Date(
          Date.now() + WITHIN_MILLISECONDS_OF_EXPIRY,
        );
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: thresholdDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
        });

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          session,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(result).toBe(session);
        expect(mockRefreshToken).not.toHaveBeenCalled();
      });

      it('returns the original session when expires is undefined', async () => {
        // GIVEN
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: undefined,
          refreshToken: 'test-refresh-token',
          isOnline: false,
        });

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          session,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(result).toBe(session);
        expect(mockRefreshToken).not.toHaveBeenCalled();
      });
    });

    describe('when distribution is ShopifyAdmin', () => {
      it('returns the original session without refreshing even if token is expired', async () => {
        // GIVEN
        // 5 seconds ago
        const expiredDate = new Date(Date.now() - 5000);
        const session = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'test-refresh-token',
          isOnline: false,
        });

        params.config.distribution = AppDistribution.ShopifyAdmin;

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          session,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(result).toBe(session);
        expect(mockRefreshToken).not.toHaveBeenCalled();
      });
    });

    describe('when session is expired and should be refreshed', () => {
      it('refreshes the token and returns the new session', async () => {
        // GIVEN
        // 5 seconds ago
        const expiredDate = new Date(Date.now() - 5000);
        const oldSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'old-refresh-token',
          isOnline: false,
          accessToken: 'old-access-token',
        });

        // 24 hours in future
        const newSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 86400000),
          refreshToken: 'new-refresh-token',
          isOnline: false,
          accessToken: 'new-access-token',
        });

        mockRefreshToken.mockResolvedValue({session: newSession});
        params.config.distribution = AppDistribution.AppStore;

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          oldSession,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(mockRefreshToken).toHaveBeenCalledWith({
          shop: TEST_SHOP,
          refreshToken: 'old-refresh-token',
        });
        expect(result).toBe(newSession);

        // Verify session was stored
        const storedSession = await sessionStorage.loadSession(newSession.id);
        expect(storedSession).toEqual(newSession);
      });

      it('refreshes the token when session expires within threshold', async () => {
        // GIVEN
        // 900ms from now
        const almostExpiredDate = new Date(
          Date.now() + WITHIN_MILLISECONDS_OF_EXPIRY - 100,
        );
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

        mockRefreshToken.mockResolvedValue({session: newSession});

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          oldSession,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(mockRefreshToken).toHaveBeenCalledWith({
          shop: TEST_SHOP,
          refreshToken: 'old-refresh-token',
        });
        expect(result).toBe(newSession);
      });

      it('refreshes the token for SingleMerchant distribution', async () => {
        // GIVEN
        const expiredDate = new Date(Date.now() - 5000);
        const oldSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'old-refresh-token',
          isOnline: false,
        });

        const newSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 86400000),
          refreshToken: 'new-refresh-token',
          isOnline: false,
        });

        mockRefreshToken.mockResolvedValue({session: newSession});
        params.config.distribution = AppDistribution.SingleMerchant;

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          oldSession,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(mockRefreshToken).toHaveBeenCalledWith({
          shop: TEST_SHOP,
          refreshToken: 'old-refresh-token',
        });
        expect(result).toBe(newSession);
      });

      it('uses the session refresh token when refreshing', async () => {
        // GIVEN
        const expiredDate = new Date(Date.now() - 5000);
        const customRefreshToken = 'my-custom-refresh-token';
        const oldSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: customRefreshToken,
          isOnline: false,
        });

        const newSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 86400000),
          refreshToken: 'new-refresh-token',
          isOnline: false,
        });

        mockRefreshToken.mockResolvedValue({session: newSession});

        // WHEN
        await ensureOfflineTokenIsNotExpired(oldSession, params, TEST_SHOP);

        // THEN
        expect(mockRefreshToken).toHaveBeenCalledWith({
          shop: TEST_SHOP,
          refreshToken: customRefreshToken,
        });
      });
    });

    describe('edge cases', () => {
      it('works correctly when distribution is not ShopifyAdmin', async () => {
        // GIVEN
        const expiredDate = new Date(Date.now() - 5000);
        const oldSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'old-refresh-token',
          isOnline: false,
        });

        const newSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: new Date(Date.now() + 86400000),
          refreshToken: 'new-refresh-token',
          isOnline: false,
        });

        mockRefreshToken.mockResolvedValue({session: newSession});
        params.config.distribution = AppDistribution.AppStore;

        // WHEN
        const result = await ensureOfflineTokenIsNotExpired(
          oldSession,
          params,
          TEST_SHOP,
        );

        // THEN
        expect(mockRefreshToken).toHaveBeenCalled();
        expect(result).toBe(newSession);
      });

      it('handles refresh token errors by propagating them', async () => {
        // GIVEN
        const expiredDate = new Date(Date.now() - 5000);
        const oldSession = setUpValidSessionImport({
          shop: TEST_SHOP,
          expires: expiredDate,
          refreshToken: 'invalid-refresh-token',
          isOnline: false,
        });

        const refreshError = new Error('Refresh token is invalid');
        mockRefreshToken.mockRejectedValue(refreshError);

        // WHEN & THEN
        await expect(
          ensureOfflineTokenIsNotExpired(oldSession, params, TEST_SHOP),
        ).rejects.toBeInstanceOf(Response);
      });
    });
  });
});
