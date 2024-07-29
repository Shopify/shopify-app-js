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
      shopify.registerWebhooks({session});
    },
  },
});

export const authenticate = shopify.authenticate;
