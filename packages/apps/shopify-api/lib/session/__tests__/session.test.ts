import {Session} from '../session';
import {testConfig} from '../../__tests__/test-config';
import {shopifyApi} from '../..';
import {AuthScopes} from '../../auth';
import {getCryptoLib} from '../../../runtime';

describe('session', () => {
  it('can create a session from another session', () => {
    const session = new Session({
      id: 'original',
      shop: 'original-shop',
      state: 'original-state',
      isOnline: true,
      accessToken: 'original-access-token',
      expires: new Date(),
      scope: 'original-scope',
      onlineAccessInfo: {
        expires_in: 1,
        associated_user_scope: 'original-scope',
        associated_user: {
          id: 1,
          first_name: 'original-first-name',
          last_name: 'original-last-name',
          email: 'original-email',
          locale: 'original-locale',
          email_verified: true,
          account_owner: true,
          collaborator: false,
        },
      },
    });
    const sessionClone = new Session({...session, id: 'clone'});

    expect(session.id).not.toEqual(sessionClone.id);
    expect(session.shop).toStrictEqual(sessionClone.shop);
    expect(session.state).toStrictEqual(sessionClone.state);
    expect(session.scope).toStrictEqual(sessionClone.scope);
    expect(session.expires).toStrictEqual(sessionClone.expires);
    expect(session.isOnline).toStrictEqual(sessionClone.isOnline);
    expect(session.accessToken).toStrictEqual(sessionClone.accessToken);
    expect(session.onlineAccessInfo).toStrictEqual(
      sessionClone.onlineAccessInfo,
    );
  });
});

describe('isActive', () => {
  it('returns true if session is active', () => {
    const shopify = shopifyApi(testConfig());

    const session = new Session({
      id: 'active',
      shop: 'active-shop',
      state: 'test_state',
      isOnline: true,
      scope: 'test_scope',
      accessToken: 'indeed',
      expires: new Date(Date.now() + 86400),
    });

    expect(session.isActive(shopify.config.scopes)).toBeTruthy();
  });
});

it('returns true when scopes that passed in undefined and scopes are not equal', () => {
  const session = new Session({
    id: 'active',
    shop: 'active-shop',
    state: 'test_state',
    isOnline: true,
    scope: 'test_scope',
    accessToken: 'indeed',
    expires: new Date(Date.now() + 86400),
  });

  expect(session.isActive(undefined)).toBeTruthy();
});

it('returns false when scopes that passed in empty and scopes are not equal', () => {
  const session = new Session({
    id: 'active',
    shop: 'active-shop',
    state: 'test_state',
    isOnline: true,
    scope: 'test_scope',
    accessToken: 'indeed',
    expires: new Date(Date.now() + 86400),
  });

  const scopes = new AuthScopes([]);
  expect(session.isActive(scopes)).toBeFalsy();
});

it('returns false if session is not active', () => {
  const shopify = shopifyApi(testConfig());

  const session = new Session({
    id: 'not_active',
    shop: 'inactive-shop',
    state: 'not_same',
    isOnline: true,
    scope: 'test_scope',
    expires: new Date(Date.now() - 1),
  });
  expect(session.isActive(shopify.config.scopes)).toBeFalsy();
});

it('returns false if checking scopes and scopes are not equal', () => {
  const session = new Session({
    id: 'not_active',
    shop: 'inactive-shop',
    state: 'not_same',
    isOnline: true,
    scope: 'test_scope',
    expires: new Date(Date.now() + 86400),
  });
  expect(session.isActive('fake_scope')).toBeFalsy();
});

describe('isExpired', () => {
  it('returns true if session is expired', () => {
    const session = new Session({
      id: 'not_active',
      shop: 'inactive-shop',
      state: 'not_same',
      isOnline: true,
      scope: 'test_scope',
      expires: new Date(Date.now() - 1),
    });
    expect(session.isExpired()).toBeTruthy();
  });

  it('returns true if session expiry is within specified value', () => {
    const session = new Session({
      id: 'not_active',
      shop: 'inactive-shop',
      state: 'not_same',
      isOnline: true,
      scope: 'test_scope',
      expires: new Date(Date.now() + 55000),
    });
    expect(session.isExpired(60000)).toBeTruthy();
  });

  it('returns false if session expiry is not within specified value', () => {
    const session = new Session({
      id: 'not_active',
      shop: 'inactive-shop',
      state: 'not_same',
      isOnline: true,
      scope: 'test_scope',
      expires: new Date(Date.now() + 75000),
    });
    expect(session.isExpired(60000)).toBeFalsy();
  });

  it('returns false if session is not expired', () => {
    const session = new Session({
      id: 'active',
      shop: 'active-shop',
      state: 'test_state',
      isOnline: true,
      scope: 'test_scope',
      accessToken: 'indeed',
      expires: new Date(Date.now() + 86400),
    });

    expect(session.isExpired()).toBeFalsy();
  });

  it('returns false if session does not have expiry', () => {
    const session = new Session({
      id: 'active',
      shop: 'active-shop',
      state: 'test_state',
      isOnline: true,
      scope: 'test_scope',
      accessToken: 'indeed',
    });

    expect(session.isExpired()).toBeFalsy();
  });
});

describe('isScopeChanged', () => {
  it('returns true if scopes requested have changed', () => {
    const shopify = shopifyApi(testConfig());
    const scopes = shopify.config.scopes
      ? shopify.config.scopes.toString()
      : '';

    const session = new Session({
      id: 'not_active',
      shop: 'inactive-shop',
      state: 'not_same',
      isOnline: true,
      scope: scopes,
      expires: new Date(Date.now() - 1),
    });
    expect(
      session.isScopeChanged(`${shopify.config.scopes}, new_scope`),
    ).toBeTruthy();
  });

  it('returns false if scopes requested are unchanged', () => {
    const shopify = shopifyApi(testConfig());
    const scopes = shopify.config.scopes
      ? shopify.config.scopes.toString()
      : '';

    const session = new Session({
      id: 'not_active',
      shop: 'inactive-shop',
      state: 'not_same',
      isOnline: true,
      scope: scopes,
      expires: new Date(Date.now() - 1),
    });
    expect(session.isScopeChanged(scopes)).toBeFalsy();
  });
});

const expiresDate = new Date(Date.now() + 86400);
const expiresNumber = expiresDate.getTime();

const testSessions = [
  {
    session: {
      id: 'offline_session_id',
      shop: 'offline-session-shop',
      state: 'offline-session-state',
      isOnline: false,
      scope: 'offline-session-scope',
      accessToken: 'offline-session-token',
      expires: expiresDate,
    },
    propertyArray: [
      ['id', 'offline_session_id'],
      ['shop', 'offline-session-shop'],
      ['state', 'offline-session-state'],
      ['isOnline', false],
      ['scope', 'offline-session-scope'],
      ['accessToken', 'offline-session-token'],
      ['expires', expiresNumber],
    ],
    returnUserData: false,
  },
  {
    session: {
      id: 'offline_session_id',
      shop: 'offline-session-shop',
      state: 'offline-session-state',
      isOnline: false,
    },
    propertyArray: [
      ['id', 'offline_session_id'],
      ['shop', 'offline-session-shop'],
      ['state', 'offline-session-state'],
      ['isOnline', false],
    ],
    returnUserData: false,
  },
  {
    session: {
      id: 'offline_session_id',
      shop: 'offline-session-shop',
      state: 'offline-session-state',
      isOnline: false,
      scope: 'offline-session-scope',
    },
    propertyArray: [
      ['id', 'offline_session_id'],
      ['shop', 'offline-session-shop'],
      ['state', 'offline-session-state'],
      ['isOnline', false],
      ['scope', 'offline-session-scope'],
    ],
    returnUserData: false,
  },
  {
    session: {
      id: 'offline_session_id',
      shop: 'offline-session-shop',
      state: 'offline-session-state',
      isOnline: false,
      accessToken: 'offline-session-token',
    },
    propertyArray: [
      ['id', 'offline_session_id'],
      ['shop', 'offline-session-shop'],
      ['state', 'offline-session-state'],
      ['isOnline', false],
      ['accessToken', 'offline-session-token'],
    ],
    returnUserData: false,
  },
  {
    session: {
      id: 'offline_session_id',
      shop: 'offline-session-shop',
      state: 'offline-session-state',
      isOnline: false,
      expires: expiresDate,
    },
    propertyArray: [
      ['id', 'offline_session_id'],
      ['shop', 'offline-session-shop'],
      ['state', 'offline-session-state'],
      ['isOnline', false],
      ['expires', expiresNumber],
    ],
    returnUserData: false,
  },
  {
    session: {
      id: 'online_session_id',
      shop: 'online-session-shop',
      state: 'online-session-state',
      isOnline: true,
      scope: 'online-session-scope',
      accessToken: 'online-session-token',
      expires: expiresDate,
      onlineAccessInfo: {
        expires_in: 1,
        associated_user_scope: 'online-session-user-scope',
        associated_user: {
          id: 1,
          first_name: 'online-session-first-name',
          last_name: 'online-session-last-name',
          email: 'online-session-email',
          locale: 'online-session-locale',
          email_verified: true,
          account_owner: true,
          collaborator: false,
        },
      },
    },
    propertyArray: [
      ['id', 'online_session_id'],
      ['shop', 'online-session-shop'],
      ['state', 'online-session-state'],
      ['isOnline', true],
      ['scope', 'online-session-scope'],
      ['accessToken', 'online-session-token'],
      ['expires', expiresNumber],
      ['onlineAccessInfo', 1],
    ],
    returnUserData: false,
  },
  {
    session: {
      id: 'online_session_id',
      shop: 'online-session-shop',
      state: 'online-session-state',
      isOnline: true,
      onlineAccessInfo: {
        expires_in: 1,
        associated_user_scope: 'online-session-user-scope',
        associated_user: {
          id: 1,
          first_name: 'online-session-first-name',
          last_name: 'online-session-last-name',
          email: 'online-session-email',
          locale: 'online-session-locale',
          email_verified: true,
          account_owner: true,
          collaborator: false,
        },
      },
    },
    propertyArray: [
      ['id', 'online_session_id'],
      ['shop', 'online-session-shop'],
      ['state', 'online-session-state'],
      ['isOnline', true],
      ['onlineAccessInfo', 1],
    ],
    returnUserData: false,
  },
  {
    session: {
      id: 'offline_session_id',
      shop: 'offline-session-shop',
      state: 'offline-session-state',
      isOnline: false,
      scope: 'offline-session-scope',
      accessToken: 'offline-session-token',
      expires: expiresDate,
    },
    propertyArray: [
      ['id', 'offline_session_id'],
      ['shop', 'offline-session-shop'],
      ['state', 'offline-session-state'],
      ['isOnline', false],
      ['scope', 'offline-session-scope'],
      ['accessToken', 'offline-session-token'],
      ['expires', expiresNumber],
    ],
    returnUserData: true,
  },
  {
    session: {
      id: 'online_session_id',
      shop: 'online-session-shop',
      state: 'online-session-state',
      isOnline: true,
      scope: 'online-session-scope',
      accessToken: 'online-session-token',
      expires: expiresDate,
      onlineAccessInfo: {
        expires_in: 1,
        associated_user_scope: 'online-session-user-scope',
        associated_user: {
          id: 1,
          first_name: 'online-session-first-name',
          last_name: 'online-session-last-name',
          email: 'online-session-email',
          locale: 'online-session-locale',
          email_verified: true,
          account_owner: true,
          collaborator: false,
        },
      },
    },
    propertyArray: [
      ['id', 'online_session_id'],
      ['shop', 'online-session-shop'],
      ['state', 'online-session-state'],
      ['isOnline', true],
      ['scope', 'online-session-scope'],
      ['accessToken', 'online-session-token'],
      ['expires', expiresNumber],
      ['userId', 1],
      ['firstName', 'online-session-first-name'],
      ['lastName', 'online-session-last-name'],
      ['email', 'online-session-email'],
      ['locale', 'online-session-locale'],
      ['emailVerified', true],
      ['accountOwner', true],
      ['collaborator', false],
    ],
    returnUserData: true,
  },
  {
    session: {
      id: 'online_session_id',
      shop: 'online-session-shop',
      state: 'online-session-state',
      isOnline: true,
      scope: 'online-session-scope',
      accessToken: 'online-session-token',
      expires: expiresDate,
      onlineAccessInfo: {
        expires_in: 1,
        associated_user_scope: 'online-session-user-scope',
        associated_user: {
          id: 1,
        },
      },
    },
    propertyArray: [
      ['id', 'online_session_id'],
      ['shop', 'online-session-shop'],
      ['state', 'online-session-state'],
      ['isOnline', true],
      ['scope', 'online-session-scope'],
      ['accessToken', 'online-session-token'],
      ['expires', expiresNumber],
      ['userId', 1],
    ],
    returnUserData: true,
  },
];

describe('toObject', () => {
  testSessions.forEach((test) => {
    const onlineOrOffline = test.session.isOnline ? 'online' : 'offline';
    it(`returns an object of an ${onlineOrOffline} session`, () => {
      const session = new Session(test.session);
      expect(session.toObject()).toStrictEqual(test.session);
    });

    it(`recreates a Session from an object form of an ${onlineOrOffline} session`, () => {
      const session = new Session(test.session);
      const sessionCopy = new Session(session.toObject());
      expect(session).toStrictEqual(sessionCopy);
    });
  });
});

describe('toPropertyArray and fromPropertyArray', () => {
  testSessions.forEach((test) => {
    const onlineOrOffline = test.session.isOnline ? 'online' : 'offline';
    const userData = test.returnUserData ? 'with' : 'without';
    it(`returns a property array of an ${onlineOrOffline} session ${userData} user data`, () => {
      const session = new Session(test.session);
      expect(session.toPropertyArray(test.returnUserData)).toStrictEqual(
        test.propertyArray,
      );
    });

    it(`recreates a Session from a property array of an ${onlineOrOffline} session ${userData} user data`, () => {
      const session = new Session(test.session);
      const sessionCopy = Session.fromPropertyArray(
        session.toPropertyArray(test.returnUserData),
        test.returnUserData,
      );

      expect(session.id).toStrictEqual(sessionCopy.id);
      expect(session.shop).toStrictEqual(sessionCopy.shop);
      expect(session.state).toStrictEqual(sessionCopy.state);
      expect(session.isOnline).toStrictEqual(sessionCopy.isOnline);
      expect(session.scope).toStrictEqual(sessionCopy.scope);
      expect(session.accessToken).toStrictEqual(sessionCopy.accessToken);
      expect(session.expires).toStrictEqual(sessionCopy.expires);
      expect(session.onlineAccessInfo?.associated_user.id).toStrictEqual(
        sessionCopy.onlineAccessInfo?.associated_user.id,
      );

      if (test.returnUserData) {
        expect(
          session.onlineAccessInfo?.associated_user.first_name,
        ).toStrictEqual(
          sessionCopy.onlineAccessInfo?.associated_user.first_name,
        );
        expect(
          session.onlineAccessInfo?.associated_user.last_name,
        ).toStrictEqual(
          sessionCopy.onlineAccessInfo?.associated_user.last_name,
        );
        expect(session.onlineAccessInfo?.associated_user.email).toStrictEqual(
          sessionCopy.onlineAccessInfo?.associated_user.email,
        );
        expect(session.onlineAccessInfo?.associated_user.locale).toStrictEqual(
          sessionCopy.onlineAccessInfo?.associated_user.locale,
        );
        expect(
          session.onlineAccessInfo?.associated_user.email_verified,
        ).toStrictEqual(
          sessionCopy.onlineAccessInfo?.associated_user.email_verified,
        );
        expect(
          session.onlineAccessInfo?.associated_user.account_owner,
        ).toStrictEqual(
          sessionCopy.onlineAccessInfo?.associated_user.account_owner,
        );
        expect(
          session.onlineAccessInfo?.associated_user.collaborator,
        ).toStrictEqual(
          sessionCopy.onlineAccessInfo?.associated_user.collaborator,
        );
        // Test that the user information is correctly moved to the associated_user object from property array
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            firstName: session.onlineAccessInfo?.associated_user.first_name,
          }),
        );
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            lastName: session.onlineAccessInfo?.associated_user.last_name,
          }),
        );
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            email: session.onlineAccessInfo?.associated_user.email,
          }),
        );
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            locale: session.onlineAccessInfo?.associated_user.locale,
          }),
        );
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            emailVerified:
              session.onlineAccessInfo?.associated_user.email_verified,
          }),
        );
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            accountOwner:
              session.onlineAccessInfo?.associated_user.account_owner,
          }),
        );
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            collaborator:
              session.onlineAccessInfo?.associated_user.collaborator,
          }),
        );
        expect(sessionCopy).toEqual(
          expect.not.objectContaining({
            associated_user: {id: session.onlineAccessInfo?.associated_user.id},
          }),
        );
      } else {
        expect(sessionCopy.onlineAccessInfo?.associated_user?.id).toStrictEqual(
          session.onlineAccessInfo?.associated_user?.id,
        );
        expect(
          sessionCopy.onlineAccessInfo?.associated_user.first_name,
        ).toBeUndefined();
        expect(
          sessionCopy.onlineAccessInfo?.associated_user.last_name,
        ).toBeUndefined();
        expect(
          sessionCopy.onlineAccessInfo?.associated_user.email,
        ).toBeUndefined();
        expect(
          sessionCopy.onlineAccessInfo?.associated_user.locale,
        ).toBeUndefined();
        expect(
          sessionCopy.onlineAccessInfo?.associated_user.email_verified,
        ).toBeUndefined();
        expect(
          sessionCopy.onlineAccessInfo?.associated_user.account_owner,
        ).toBeUndefined();
        expect(
          sessionCopy.onlineAccessInfo?.associated_user.collaborator,
        ).toBeUndefined();
      }
    });
    const describe = test.session.isOnline ? 'Does' : 'Does not';
    const isOnline = test.session.isOnline ? 'online' : 'offline';

    it(`${describe} have online access info when the token is ${isOnline}`, () => {
      const session = new Session(test.session);
      const sessionCopy = Session.fromPropertyArray(
        session.toPropertyArray(test.returnUserData),
        test.returnUserData,
      );
      if (test.session.isOnline) {
        expect(sessionCopy.onlineAccessInfo).toBeDefined();
      } else {
        expect(sessionCopy.onlineAccessInfo).toBeUndefined();
      }
    });
  });
});

describe('toEncryptedPropertyArray and fromEncryptedPropertyArray', () => {
  let cryptoKey: CryptoKey;

  beforeEach(async () => {
    const cryptoLib = getCryptoLib();

    cryptoKey = await cryptoLib.subtle.generateKey(
      {name: 'AES-GCM', length: 256},
      true,
      ['encrypt', 'decrypt'],
    );
  });

  testSessions.forEach((test) => {
    const onlineOrOffline = test.session.isOnline ? 'online' : 'offline';
    const userData = test.returnUserData ? 'with' : 'without';

    it(`returns a property array of an ${onlineOrOffline} session ${userData} user data`, async () => {
      // GIVEN
      const getPropIndex = (object: any, prop: string, check = true) => {
        const index = object.findIndex((property: any) => property[0] === prop);

        if (check) expect(index).toBeGreaterThan(-1);

        return index;
      };

      const session = new Session(test.session);
      const testProps = [...test.propertyArray];

      // WHEN
      const actualProps = await session.toEncryptedPropertyArray({
        cryptoKey,
        returnUserData: test.returnUserData,
      });

      // THEN

      // The token is encrypted, so the values will be different
      const tokenIndex = getPropIndex(testProps, 'accessToken', false);
      const actualTokenIndex = getPropIndex(actualProps, 'accessToken', false);

      if (actualTokenIndex > -1 && tokenIndex > -1) {
        expect(
          actualProps[actualTokenIndex][1].toString().startsWith('encrypted#'),
        ).toBeTruthy();

        actualProps.splice(actualTokenIndex, 1);
        testProps.splice(tokenIndex, 1);
      }

      expect(actualProps).toStrictEqual(testProps);
    });

    it(`recreates a Session from a property array of an ${onlineOrOffline} session ${userData} user data`, async () => {
      // GIVEN
      const session = new Session(test.session);

      // WHEN
      const actualSession = await Session.fromEncryptedPropertyArray(
        await session.toEncryptedPropertyArray({
          cryptoKey,
          returnUserData: test.returnUserData,
        }),
        {cryptoKey, returnUserData: test.returnUserData},
      );

      // THEN
      expect(actualSession.id).toStrictEqual(session.id);
      expect(actualSession.shop).toStrictEqual(session.shop);
      expect(actualSession.state).toStrictEqual(session.state);
      expect(actualSession.isOnline).toStrictEqual(session.isOnline);
      expect(actualSession.scope).toStrictEqual(session.scope);
      expect(actualSession.accessToken).toStrictEqual(session.accessToken);
      expect(actualSession.expires).toStrictEqual(session.expires);

      const user = session.onlineAccessInfo?.associated_user;
      const actualUser = actualSession.onlineAccessInfo?.associated_user;
      expect(actualUser?.id).toStrictEqual(user?.id);

      if (test.returnUserData) {
        if (user && actualUser) {
          expect(actualUser).toMatchObject(user);
        } else {
          expect(actualUser).toBeUndefined();
          expect(user).toBeUndefined();
        }
      } else {
        expect(actualUser?.first_name).toBeUndefined();
        expect(actualUser?.last_name).toBeUndefined();
        expect(actualUser?.email).toBeUndefined();
        expect(actualUser?.locale).toBeUndefined();
        expect(actualUser?.email_verified).toBeUndefined();
        expect(actualUser?.account_owner).toBeUndefined();
        expect(actualUser?.collaborator).toBeUndefined();
      }
    });

    const describe = test.session.isOnline ? 'Does' : 'Does not';
    const isOnline = test.session.isOnline ? 'online' : 'offline';

    it(`${describe} have online access info when the token is ${isOnline}`, async () => {
      // GIVEN
      const session = new Session(test.session);

      // WHEN
      const actualSession = await Session.fromEncryptedPropertyArray(
        await session.toEncryptedPropertyArray({
          cryptoKey,
          returnUserData: test.returnUserData,
        }),
        {cryptoKey, returnUserData: test.returnUserData},
      );

      // THEN
      if (test.session.isOnline) {
        expect(actualSession.onlineAccessInfo).toBeDefined();
      } else {
        expect(actualSession.onlineAccessInfo).toBeUndefined();
      }
    });
  });

  it('fails to decrypt an invalid token', async () => {
    // GIVEN
    const session = new Session({
      id: 'offline_session_id',
      shop: 'offline-session-shop',
      state: 'offline-session-state',
      isOnline: false,
      scope: 'offline-session-scope',
      accessToken: 'offline-session-token',
      expires: expiresDate,
    });

    const props = await session.toEncryptedPropertyArray({
      cryptoKey,
      returnUserData: false,
    });

    // WHEN
    const tamperedProps = props.map((derp) => {
      return [
        derp[0],
        derp[0] === 'accessToken' ? 'encrypted#invalid token' : derp[1],
      ] as [string, string | number | boolean];
    });

    // THEN
    await expect(async () =>
      Session.fromEncryptedPropertyArray(tamperedProps, {
        cryptoKey,
        returnUserData: false,
      }),
    ).rejects.toThrow('The provided data is too small.');
  });

  describe('encrypting multiple fields', () => {
    let session: Session;

    beforeEach(() => {
      session = new Session({
        id: 'offline_session_id',
        shop: 'example.myshopify.io',
        state: 'offline-session-state',
        isOnline: true,
        scope: 'test_scope',
        accessToken: 'offline-session-token',
        expires: expiresDate,
        onlineAccessInfo: {
          expires_in: 1,
          associated_user_scope: 'user_scope',
          associated_user: {
            id: 1,
            first_name: 'first-name',
            last_name: 'last-name',
            email: 'email',
            locale: 'locale',
            email_verified: true,
            account_owner: true,
            collaborator: false,
          },
        },
      });
    });

    it('can encrypt and decrypt all fields', async () => {
      // GIVEN
      const encryptFields = [
        'shop',
        'state',
        'scope',
        'accessToken',
        'userId',
        'firstName',
        'lastName',
        'email',
        'locale',
      ];

      // WHEN
      const encryptedProps = await session.toEncryptedPropertyArray({
        cryptoKey,
        propertiesToEncrypt: encryptFields,
        returnUserData: true,
      });
      const newSession = await Session.fromEncryptedPropertyArray(
        encryptedProps,
        {cryptoKey, returnUserData: true},
      );

      // THEN
      expect(encryptedProps).toMatchObject([
        ['id', 'offline_session_id'],
        ['shop', expect.stringMatching(/^encrypted#/)],
        ['state', expect.stringMatching(/^encrypted#/)],
        ['isOnline', true],
        ['scope', expect.stringMatching(/^encrypted#/)],
        ['accessToken', expect.stringMatching(/^encrypted#/)],
        ['expires', expect.any(Number)],
        ['userId', expect.stringMatching(/^encrypted#/)],
        ['firstName', expect.stringMatching(/^encrypted#/)],
        ['lastName', expect.stringMatching(/^encrypted#/)],
        ['email', expect.stringMatching(/^encrypted#/)],
        ['locale', expect.stringMatching(/^encrypted#/)],
        ['emailVerified', true],
        ['accountOwner', true],
        ['collaborator', false],
      ]);
      expect(newSession.equals(session)).toBeTruthy();
    });

    it('can encrypt and decrypt custom fields', async () => {
      // GIVEN
      const sessionWithCustomFields = new Session({
        ...session.toObject(),
        customField: 'custom',
      });

      // WHEN
      const encryptedProps =
        await sessionWithCustomFields.toEncryptedPropertyArray({
          cryptoKey,
          propertiesToEncrypt: ['customField'],
          returnUserData: true,
        });
      const newSession = await Session.fromEncryptedPropertyArray(
        encryptedProps,
        {cryptoKey, returnUserData: true},
      );

      // THEN
      const index = encryptedProps.findIndex(([key]) => key === 'customField');
      expect(index).toBeGreaterThan(-1);
      expect(encryptedProps[index][1]).toMatch(/^encrypted#/);
      expect((newSession as any).customField).toEqual(
        (sessionWithCustomFields as any).customField,
      );
    });

    it.each(['id', 'expires', 'emailVerified', 'accountOwner', 'collaborator'])(
      "can't encrypt '%s' field",
      async (field) => {
        // WHEN
        await expect(
          session.toEncryptedPropertyArray({
            cryptoKey,
            propertiesToEncrypt: [field],
            returnUserData: true,
          }),
        ).rejects.toThrow(`Can't encrypt fields: [${field}]`);
      },
    );
  });
});
