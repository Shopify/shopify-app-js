import {shopifyApp} from '@shopify/shopify-app-remix';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

export const shopify = shopifyApp({
  sessionStorage: new MemorySessionStorage(),
  // ...
});

// When fetching a session id from a source other than a Shopify request
const sessionId = obtainSessionId();

const session = await shopify.sessionStorage.loadSession(sessionId);
await shopify.sessionStorage.storeSession(session);
