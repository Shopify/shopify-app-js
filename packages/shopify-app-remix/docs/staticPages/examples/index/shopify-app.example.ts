import '@shopify/shopify-app-remix/server/adapters/node';
import {
  LATEST_API_VERSION,
  shopifyApp,
} from '@shopify/shopify-app-remix/server';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ['read_products'],
  apiVersion: LATEST_API_VERSION,
});
export default shopify;
