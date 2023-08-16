import {shopifyApp} from '@shopify/shopify-app-remix';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(',')!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  sessionStorage: new MemorySessionStorage(),
});
