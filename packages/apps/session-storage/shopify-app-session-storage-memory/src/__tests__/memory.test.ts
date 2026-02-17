import {Session} from '@shopify/shopify-api';
import {batteryOfTests} from '@shopify/shopify-app-session-storage-test-utils';

import {MemorySessionStorage} from '../memory';

describe('MemorySessionStorage', () => {
  let storage: MemorySessionStorage;
  beforeAll(async () => {
    storage = new MemorySessionStorage();
  });

  batteryOfTests(async () => storage);

  it('can store and delete sessions with refresh tokens', async () => {
    const sessionId = 'test_refresh_token_session';

    // Test session with refresh token only
    const sessionWithRefreshToken = new Session({
      id: sessionId,
      shop: 'shop',
      state: 'state',
      isOnline: false,
      scope: 'test_scope',
      accessToken: 'access_token_123',
      refreshToken: 'refresh_token_456',
    });

    await expect(
      storage.storeSession(sessionWithRefreshToken),
    ).resolves.toBeTruthy();
    let storedSession = await storage.loadSession(sessionId);
    expect(sessionWithRefreshToken.equals(storedSession)).toBeTruthy();
    expect(storedSession?.refreshToken).toBe('refresh_token_456');
    expect(storedSession?.refreshTokenExpires).toBeUndefined();

    // Test session with refresh token and expiry
    const refreshTokenExpiryDate = new Date();
    refreshTokenExpiryDate.setMilliseconds(0);
    refreshTokenExpiryDate.setDate(refreshTokenExpiryDate.getDate() + 30);

    const sessionWithRefreshTokenAndExpiry = new Session({
      id: sessionId,
      shop: 'shop',
      state: 'state',
      isOnline: false,
      scope: 'test_scope',
      accessToken: 'access_token_789',
      refreshToken: 'refresh_token_abc',
      refreshTokenExpires: refreshTokenExpiryDate,
    });

    await expect(
      storage.storeSession(sessionWithRefreshTokenAndExpiry),
    ).resolves.toBeTruthy();
    storedSession = await storage.loadSession(sessionId);
    expect(sessionWithRefreshTokenAndExpiry.equals(storedSession)).toBeTruthy();
    expect(storedSession?.refreshToken).toBe('refresh_token_abc');
    expect(storedSession?.refreshTokenExpires).toEqual(refreshTokenExpiryDate);

    // Clean up
    await expect(storage.deleteSession(sessionId)).resolves.toBeTruthy();
    await expect(storage.loadSession(sessionId)).resolves.toBeUndefined();
  });
});
