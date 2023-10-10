import {shopifyApp} from '@shopify/shopify-app-remix/server';

export const shopify = shopifyApp({
  // ...
  future: {
    unstable_newFeature: true,
  },
});
