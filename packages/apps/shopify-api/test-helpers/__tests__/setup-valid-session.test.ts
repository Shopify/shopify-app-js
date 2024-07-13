import {setUpValidSession} from '../setup-valid-session';
import {TEST_SHOP, USER_ID} from '../const';
import {Session} from '../../lib';

describe('setUpValidSession()', () => {
  it('creates a Session', () => {
    const session = setUpValidSession({
      shop: TEST_SHOP,
    });

    expect(session).toBeInstanceOf(Session);
  });

  it('can overwrite session parameters', () => {
    const defaultSession = setUpValidSession({
      shop: TEST_SHOP,
    });
    expect(defaultSession.state).toBe('test');

    const testSession = setUpValidSession({
      shop: TEST_SHOP,
      state: 'overwritten',
    });
    expect(testSession.state).toBe('overwritten');
  });

  it('can create an online session', () => {
    const session = setUpValidSession({
      shop: TEST_SHOP,
      isOnline: true,
    });
    expect(session.id).toBe(`${TEST_SHOP}_${USER_ID}`);
  });

  it('can overwrite onlineAccessInfo parameters', () => {
    const defaultSession = setUpValidSession({
      shop: TEST_SHOP,
      isOnline: true,
    });
    expect(defaultSession.onlineAccessInfo?.associated_user_scope).toBe(
      'testScope',
    );

    const testSession = setUpValidSession({
      shop: TEST_SHOP,
      isOnline: true,
      onlineAccessInfo: {
        associated_user_scope: 'overwritten',
      },
    });
    const overwrittenUserScope =
      testSession.onlineAccessInfo?.associated_user_scope;
    expect(overwrittenUserScope).toBe('overwritten');
  });

  it('can overwrite onlineAccessInfo.associated_user parameters', () => {
    const defaultSession = setUpValidSession({
      shop: TEST_SHOP,
      isOnline: true,
    });
    expect(defaultSession.onlineAccessInfo?.associated_user.id).toBe(USER_ID);

    const testSession = setUpValidSession({
      shop: TEST_SHOP,
      isOnline: true,
      onlineAccessInfo: {
        associated_user: {
          id: 1,
        },
      },
    });
    const overwrittenUserId = testSession.onlineAccessInfo?.associated_user.id;
    expect(overwrittenUserId).not.toBe(USER_ID);
    expect(overwrittenUserId).toBe(1);
  });
});
