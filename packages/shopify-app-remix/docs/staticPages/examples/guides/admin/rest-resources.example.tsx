import {shopifyApp} from '@shopify/shopify-app-remix/server';
import {restResources} from '@shopify/shopify-api/rest/admin/2023-07';

const shopify = shopifyApp({
  restResources,
  // ...etc
});

export const authenticate = shopify.authenticate;
