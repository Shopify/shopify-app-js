import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {Session} from '@shopify/shopify-api';
import {setUpValidSession as setUpValidSessionImport} from '@shopify/shopify-api/test-helpers';

import {TEST_SHOP} from './const';

export async function setUpValidSession(
  sessionStorage: SessionStorage,
  sessionParams?: Partial<Session>,
): Promise<Session> {
  const session = setUpValidSessionImport({
    shop: TEST_SHOP,
    ...sessionParams,
  });

  await sessionStorage.storeSession(session);

  return session;
}

export function setupValidCustomAppSession(shop: string): Session {
  return new Session({
    id: '',
    shop,
    state: '',
    isOnline: false,
  });
}
