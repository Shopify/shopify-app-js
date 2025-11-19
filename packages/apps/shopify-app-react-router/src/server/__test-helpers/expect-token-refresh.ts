import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import {TestOverridesArg} from '../test-helpers/test-config';
import {AppDistribution} from '../types';

import {API_KEY, API_SECRET_KEY, TEST_SHOP} from './const';
import {mockExternalRequest} from './request-mock';
import {
  setUpValidSession,
  setupValidCustomAppSession,
} from './setup-valid-session';

export function expectTokenRefresh(
  runAuth: (
    sessionStorage: SessionStorage,
    session: Session,
    configOverrides?: TestOverridesArg,
  ) => Promise<Session>,
) {
  describe('token refresh for expired offline sessions', () => {
    it('does not refresh token when session is not expired', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const oneHourFromNow = new Date(Date.now() + 1000 * 3600);
      const session = await setUpValidSession(sessionStorage, {
        expires: oneHourFromNow,
        refreshToken: 'test-refresh-token',
      });

      // WHEN
      const actualSession = await runAuth(sessionStorage, session);

      // THEN
      expect(actualSession.accessToken).toBe(session.accessToken);
      expect(actualSession.expires?.getTime()).toBe(oneHourFromNow.getTime());
    });

    it('refreshes token when session is expired and feature flag is enabled', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const oneSecondAgo = new Date(Date.now() - 1000);
      const thirtyDaysFromNow = new Date(Date.now() + 1000 * 3600 * 24 * 30);

      const session = await setUpValidSession(sessionStorage, {
        expires: oneSecondAgo,
        refreshToken: 'test-refresh-token',
        refreshTokenExpires: thirtyDaysFromNow,
      });

      const refreshResponse = {
        access_token: 'new-access-token',
        scope: 'testScope',
        expires_in: 3600,
        refresh_token: 'new-refresh-token',
        refresh_token_expires_in: 2592000,
      };

      await mockExternalRequest({
        request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            client_id: API_KEY,
            client_secret: API_SECRET_KEY,
            refresh_token: 'test-refresh-token',
            grant_type: 'refresh_token',
          }),
        }),
        response: new Response(JSON.stringify(refreshResponse), {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        }),
      });

      // WHEN
      const actualSession = await runAuth(sessionStorage, session);

      // THEN
      expect(actualSession.accessToken).toBe('new-access-token');
      expect(actualSession.refreshToken).toBe('new-refresh-token');
      expect(actualSession.id).toBe(session.id);
      expect(actualSession.shop).toBe(TEST_SHOP);
      expect(actualSession.expires?.getTime()).toBeGreaterThan(Date.now());
    });

    it('refreshes token when session is within milliseconds of expiry', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const halfSecondFromNow = new Date(Date.now() + 500);
      const thirtyDaysFromNow = new Date(Date.now() + 1000 * 3600 * 24 * 30);

      const session = await setUpValidSession(sessionStorage, {
        expires: halfSecondFromNow,
        refreshToken: 'test-refresh-token',
        refreshTokenExpires: thirtyDaysFromNow,
      });

      const refreshResponse = {
        access_token: 'new-access-token-2',
        scope: 'testScope',
        expires_in: 3600,
        refresh_token: 'new-refresh-token-2',
        refresh_token_expires_in: 2592000,
      };

      await mockExternalRequest({
        request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            client_id: API_KEY,
            client_secret: API_SECRET_KEY,
            refresh_token: 'test-refresh-token',
            grant_type: 'refresh_token',
          }),
        }),
        response: new Response(JSON.stringify(refreshResponse), {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        }),
      });

      // WHEN
      const actualSession = await runAuth(sessionStorage, session);

      // THEN
      expect(actualSession.accessToken).toBe('new-access-token-2');
      expect(actualSession.refreshToken).toBe('new-refresh-token-2');
    });

    it('does not refresh token when session has no expiry', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const session = await setUpValidSession(sessionStorage, {
        expires: undefined,
        refreshToken: 'test-refresh-token',
      });

      // WHEN
      const actualSession = await runAuth(sessionStorage, session);

      // THEN
      expect(actualSession.accessToken).toBe(session.accessToken);
      expect(actualSession.expires).toBeUndefined();
    });

    it('does not refresh token when feature flag is disabled even if session is expired', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const oneSecondAgo = new Date(Date.now() - 1000);
      const session = await setUpValidSession(sessionStorage, {
        expires: oneSecondAgo,
        refreshToken: 'test-refresh-token',
      });

      // WHEN
      const actualSession = await runAuth(sessionStorage, session, {
        future: {
          expiringOfflineAccessTokens: false,
        },
      });

      // THEN
      expect(actualSession.accessToken).toBe(session.accessToken);
      expect(actualSession.expires?.getTime()).toBe(oneSecondAgo.getTime());
      expect(actualSession.refreshToken).toBe('test-refresh-token');
    });

    it('does not refresh token when distribution is ShopifyAdmin', async () => {
      // GIVEN
      const sessionStorage = new MemorySessionStorage();
      const session = setupValidCustomAppSession(TEST_SHOP);

      // WHEN
      const actualSession = await runAuth(sessionStorage, session, {
        distribution: AppDistribution.ShopifyAdmin,
      });

      // THEN
      expect(actualSession).toBeDefined();
      expect(actualSession.shop).toBe(TEST_SHOP);
      expect(actualSession.expires).toBeUndefined();
      expect(actualSession.refreshToken).toBeUndefined();
    });
  });
}
