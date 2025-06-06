import {shopifyApp, DeliveryMethod} from '@shopify/shopify-app-remix/server';

const shopify = shopifyApp({
  apiKey: 'abcde1234567890',
  // ...etc
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/webhooks',
    },
  },
  hooks: {
    afterAuth: async ({session}) => {
      // Register webhooks for the shop
      // In this example, every shop will have these webhooks
      // You could wrap this in some custom shop specific conditional logic if needed
      shopify.registerWebhooks({session});
    },
  },
});

export const authenticate = shopify.authenticate;
