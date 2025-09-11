import '@shopify/shopify-app-remix/server/adapters/node';
import {ApiVersion, shopifyApp} from '@shopify/shopify-app-remix/server';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ['read_products'],
  apiVersion: ApiVersion.July25,
});
export default shopify;
