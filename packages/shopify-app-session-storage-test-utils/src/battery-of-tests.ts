import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

import {sessionArraysEqual} from './session-test-utils';

const testScopes = ['test_scope'];

export function batteryOfTests(storageFactory: () => Promise<SessionStorage>) {
  it('can store and delete all kinds of sessions', async () => {
    const sessionFactories = [
      async () => {
        const session = new Session({
          id: sessionId,
          shop: 'shop',
          state: 'state',
          isOnline: false,
          scope: testScopes.toString(),
          accessToken: '123',
        });
        return session;
      },
      async () => {
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 60);
        const session = new Session({
          id: sessionId,
          shop: 'shop',
          state: 'state',
          isOnline: false,
          expires: expiryDate,
          accessToken: '123',
          scope: testScopes.toString(),
        });
        return session;
      },
      async () => {
        const session = new Session({
          id: sessionId,
          shop: 'shop',
          state: 'state',
          isOnline: false,
          expires: null as any,
          scope: testScopes.toString(),
          accessToken: '123',
        });
        return session;
      },
      async () => {
        const session = new Session({
          id: sessionId,
          shop: 'shop',
          state: 'state',
          isOnline: false,
          expires: undefined,
          scope: testScopes.toString(),
          accessToken: '123',
        });
        return session;
      },
      async () => {
        const session = new Session({
          id: sessionId,
          shop: 'shop',
          state: 'state',
          isOnline: false,
          onlineAccessInfo: {associated_user: {id: 123}} as any,
          scope: testScopes.toString(),
          accessToken: '123',
        });
        return session;
      },
    ];

    const sessionId = 'test_session';
    const storage = await storageFactory();
    for (const factory of sessionFactories) {
      const session = await factory();

      await expect(storage.storeSession(session)).resolves.toBeTruthy();
      const storedSession = await storage.loadSession(sessionId);
      expect(session.equals(storedSession)).toBeTruthy();

      expect(storedSession?.isActive(testScopes)).toBeTruthy();

      await expect(storage.deleteSession(sessionId)).resolves.toBeTruthy();
      await expect(storage.loadSession(sessionId)).resolves.toBeUndefined();

      // Deleting a non-existing session should work
      await expect(storage.deleteSession(sessionId)).resolves.toBeTruthy();
    }
  });

  it('can store sessions with unexpected fields', async () => {
    const storage = await storageFactory();
    const sessionId = 'test_session';
    const session = new Session({
      id: sessionId,
      shop: 'shop',
      state: 'state',
      isOnline: true,
    });
    (session as any).someField = 'lol';

    await expect(storage.storeSession(session)).resolves.toBeTruthy();
    const storedSession = await storage.loadSession(sessionId);
    expect(session.equals(storedSession)).toBeTruthy();
  });

  it('can store and delete sessions with online tokens', async () => {
    const storage = await storageFactory();
    const sessionId = 'test_session';
    const session = new Session({
      id: sessionId,
      shop: 'shop',
      state: 'state',
      isOnline: true,
    });

    await expect(storage.storeSession(session)).resolves.toBeTruthy();
    const storedSession = await storage.loadSession(sessionId);
    expect(session.equals(storedSession)).toBeTruthy();
  });

  it('wrong ids return null sessions', async () => {
    const storage = await storageFactory();
    await expect(
      storage.loadSession('not_a_session_id'),
    ).resolves.toBeUndefined();
  });

  it('can find all the sessions for a given shop', async () => {
    const storage = await storageFactory();
    const prefix = 'find_sessions';
    const sessions = [
      new Session({
        id: `${prefix}_1`,
        shop: 'find-shop1-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: `${prefix}_2`,
        shop: 'do-not-find-shop2-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: `${prefix}_3`,
        shop: 'find-shop1-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: `${prefix}_4`,
        shop: 'do-not-find-shop3-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
    ];

    for (const session of sessions) {
      await expect(storage.storeSession(session)).resolves.toBeTruthy();
    }
    expect(storage.findSessionsByShop).toBeDefined();
    if (storage.findSessionsByShop) {
      const shop1Sessions = await storage.findSessionsByShop(
        'find-shop1-sessions.myshopify.io',
      );
      expect(shop1Sessions).toBeDefined();
      if (shop1Sessions) {
        expect(shop1Sessions.length).toBe(2);
        expect(
          sessionArraysEqual(shop1Sessions, [
            sessions[0] as Session,
            sessions[2] as Session,
          ]),
        ).toBeTruthy();
      }
    }
  });

  it('can delete the sessions for a given array of ids', async () => {
    const storage = await storageFactory();
    const prefix = 'delete_sessions';
    const sessions = [
      new Session({
        id: `${prefix}_1`,
        shop: 'delete-shop1-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: `${prefix}_2`,
        shop: 'do-not-delete-shop2-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: `${prefix}_3`,
        shop: 'delete-shop1-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
      new Session({
        id: `${prefix}_4`,
        shop: 'do-not-delete-shop3-sessions.myshopify.io',
        state: 'state',
        isOnline: true,
      }),
    ];

    for (const session of sessions) {
      await expect(storage.storeSession(session)).resolves.toBeTruthy();
    }
    expect(storage.deleteSessions).toBeDefined();
    if (storage.deleteSessions && storage.findSessionsByShop) {
      let shop1Sessions = await storage.findSessionsByShop(
        'delete-shop1-sessions.myshopify.io',
      );
      expect(shop1Sessions).toBeDefined();
      if (shop1Sessions) {
        expect(shop1Sessions.length).toBe(2);
        const idsToDelete = shop1Sessions.map((session) => session.id);
        await expect(storage.deleteSessions(idsToDelete)).resolves.toBeTruthy();
        shop1Sessions = await storage.findSessionsByShop(
          'delete-shop1-sessions.myshopify.io',
        );
        expect(shop1Sessions).toEqual([]);
      }
    }
  });
}
