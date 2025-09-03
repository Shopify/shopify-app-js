import {createSession} from '../create-session';
import {Session, shopifyApi} from '../../..';
import {testConfig} from '../../../__tests__/test-config';

const SHOP = 'someshop.myshopify.io';

jest.useFakeTimers().setSystemTime(new Date('2023-11-11'));

describe('createSession', () => {
  describe('when receiving an offline token with no expiry', () => {
    test.each([true, false])(
      `creates a new offline session with no expiry when embedded is %s`,
      (isEmbeddedApp) => {
        const shopify = shopifyApi(testConfig({isEmbeddedApp}));
        const scopes = shopify.config.scopes
          ? shopify.config.scopes.toString()
          : '';

        const accessTokenResponse = {
          access_token: 'some access token string',
          scope: scopes,
        };

        const session = createSession({
          config: shopify.config,
          accessTokenResponse,
          shop: SHOP,
          state: 'test-state',
        });

        expect(session).toEqual(
          new Session({
            id: `offline_${SHOP}`,
            shop: SHOP,
            isOnline: false,
            state: 'test-state',
            accessToken: accessTokenResponse.access_token,
            scope: accessTokenResponse.scope,
          }),
        );
      },
    );
  });
  describe('when receiving an offline token with expiry', () => {
    test.each([true, false])(
      `creates a new offline session with expiry when embedded is %s`,
      (isEmbeddedApp) => {
        const shopify = shopifyApi(testConfig({isEmbeddedApp}));
        const scopes = shopify.config.scopes
          ? shopify.config.scopes.toString()
          : '';

        const accessTokenResponse = {
          access_token: 'some access token string',
          scope: scopes,
          expires_in: 525600,
        };

        const session = createSession({
          config: shopify.config,
          accessTokenResponse,
          shop: SHOP,
          state: 'test-state',
        });

        expect(session).toEqual(
          new Session({
            id: `offline_${SHOP}`,
            shop: SHOP,
            isOnline: false,
            state: 'test-state',
            accessToken: accessTokenResponse.access_token,
            scope: accessTokenResponse.scope,
            expires: new Date(
              Date.now() + accessTokenResponse.expires_in * 1000,
            ),
          }),
        );
      },
    );
  });

  describe('when receiving an online token', () => {
    test('creates a new online session with shop_user as id when embedded is true', () => {
      const shopify = shopifyApi(testConfig({isEmbeddedApp: true}));

      const onlineAccessInfo = {
        expires_in: 525600,
        associated_user_scope: 'pet_kitties',
        associated_user: {
          id: 8675309,
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          email_verified: true,
          account_owner: true,
          locale: 'en',
          collaborator: true,
        },
      };

      const accessTokenResponse = {
        access_token: 'some access token',
        scope: 'pet_kitties, walk_dogs',
        ...onlineAccessInfo,
      };

      const session = createSession({
        config: shopify.config,
        accessTokenResponse,
        shop: SHOP,
        state: 'test-state',
      });

      expect(session).toEqual(
        new Session({
          id: `${SHOP}_${onlineAccessInfo.associated_user.id}`,
          shop: SHOP,
          isOnline: true,
          state: 'test-state',
          accessToken: accessTokenResponse.access_token,
          scope: accessTokenResponse.scope,
          expires: new Date(Date.now() + onlineAccessInfo.expires_in * 1000),
          onlineAccessInfo,
        }),
      );
    });

    test('creates a new online session with uuid as id when embedded is false', () => {
      const shopify = shopifyApi(testConfig({isEmbeddedApp: false}));

      const onlineAccessInfo = {
        expires_in: 525600,
        associated_user_scope: 'pet_kitties',
        associated_user: {
          id: 8675309,
          first_name: 'John',
          last_name: 'Smith',
          email: 'john@example.com',
          email_verified: true,
          account_owner: true,
          locale: 'en',
          collaborator: true,
        },
      };

      const accessTokenResponse = {
        access_token: 'some access token',
        scope: 'pet_kitties, walk_dogs',
        ...onlineAccessInfo,
      };

      const staticUuid = 'test-uuid-test-uiid-test';
      jest.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(staticUuid);

      const session = createSession({
        config: shopify.config,
        accessTokenResponse,
        shop: SHOP,
        state: 'test-state',
      });

      expect(session).toEqual(
        new Session({
          id: staticUuid,
          shop: SHOP,
          isOnline: true,
          state: 'test-state',
          accessToken: accessTokenResponse.access_token,
          scope: accessTokenResponse.scope,
          expires: new Date(Date.now() + onlineAccessInfo.expires_in * 1000),
          onlineAccessInfo,
        }),
      );
    });
  });
});
