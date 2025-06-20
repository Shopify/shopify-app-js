import {shopifyApp} from '@shopify/shopify-app-react-router/server';

export const shopify = shopifyApp({
  // ...
  future: {
    unstable_newFeature: true,
  },
});
